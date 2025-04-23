import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import { createLogger } from "@/lib/telemetry/logger";

const logger = createLogger("error-repository");

export interface ErrorFilters {
  projectId?: string;
  environment?: string;
  status?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  sessionId?: string;
  page?: number;
  limit?: number;
}

export class ErrorRepository {
  /**
   * Track a new error occurrence or update existing error
   */
  static async trackError(errorData: any): Promise<Error> {
    try {
      // Generate a fingerprint for the error to identify duplicates
      const fingerprint = this.generateErrorFingerprint(errorData);

      // Check if error already exists
      const existingError = await prisma.error.findFirst({
        where: {
          projectId: errorData.projectId || "default",
          environment: errorData.environment || "production",
          AND: [
            { message: errorData.message },
            { source: errorData.source || null },
            { type: errorData.error?.name || null },
          ],
          fingerprint,
        },
      });

      if (existingError) {
        // Update existing error
        const updated = await prisma.error.update({
          where: { id: existingError.id },
          data: {
            count: { increment: 1 },
            lastSeen: new Date(),
            // Only update status to ACTIVE if it's RESOLVED to prevent overriding IGNORED
            status: existingError.status === "RESOLVED" ? "ACTIVE" : undefined,
            // Create a new occurrence record
            occurrences: {
              create: {
                sessionId: errorData.sessionId,
                userId: errorData.userId,
                metadata: errorData.metadata || {},
              },
            },
          },
        });

        logger.info(`Updated existing error: ${updated.id}`, {
          errorId: updated.id,
        });
        return updated;
      }

      // Create new error record
      const newError = await prisma.error.create({
        data: {
          message: errorData.message,
          stack: errorData.error?.stack,
          source: errorData.source,
          lineno: errorData.lineno,
          colno: errorData.colno,
          type: errorData.error?.name,
          url: errorData.url,
          componentStack: errorData.componentStack,
          browserInfo: errorData.userAgent,
          userId: errorData.userId,
          sessionId: errorData.sessionId,
          projectId: errorData.projectId || "default",
          environment: errorData.environment || "production",
          occurrences: {
            create: {
              sessionId: errorData.sessionId,
              userId: errorData.userId,
              metadata: errorData.metadata || {},
            },
          },
          tags: {
            connectOrCreate: this.extractTags(errorData).map((tag) => ({
              where: { key_value: { key: tag.key, value: tag.value } },
              create: tag,
            })),
          },
        },
      });

      logger.info(`Created new error: ${newError.id}`, {
        errorId: newError.id,
      });
      return newError;
    } catch (error) {
      logger.error("Failed to track error", { error });
      throw error;
    }
  }

  /**
   * Get errors with filtering and pagination
   */
  static async getErrors(
    filters: ErrorFilters
  ): Promise<{ errors: Error[]; total: number }> {
    const { page = 1, limit = 20, ...restFilters } = filters;
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: Prisma.ErrorWhereInput = {
      projectId: restFilters.projectId,
      environment: restFilters.environment,
      status: restFilters.status as any,
      userId: restFilters.userId,
      sessionId: restFilters.sessionId,
      firstSeen: {
        gte: restFilters.startDate,
        lte: restFilters.endDate,
      },
      ...(restFilters.search
        ? {
            OR: [
              {
                message: { contains: restFilters.search, mode: "insensitive" },
              },
              { source: { contains: restFilters.search, mode: "insensitive" } },
              { url: { contains: restFilters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    // Clean up undefined values
    Object.keys(where).forEach((key) => {
      if (where[key] === undefined) {
        delete where[key];
      }
    });

    try {
      // Get errors with count
      const [errors, total] = await Promise.all([
        prisma.error.findMany({
          where,
          orderBy: { lastSeen: "desc" },
          skip,
          take: limit,
          include: {
            _count: {
              select: { occurrences: true },
            },
            tags: true,
          },
        }),
        prisma.error.count({ where }),
      ]);

      return { errors, total };
    } catch (error) {
      logger.error("Failed to get errors", { error, filters });
      throw error;
    }
  }

  /**
   * Get a specific error by ID with its recent occurrences
   */
  static async getErrorById(id: string): Promise<Error | null> {
    try {
      return prisma.error.findUnique({
        where: { id },
        include: {
          occurrences: {
            orderBy: { timestamp: "desc" },
            take: 10,
          },
          tags: true,
        },
      });
    } catch (error) {
      logger.error("Failed to get error by ID", { errorId: id, error });
      throw error;
    }
  }

  /**
   * Update error status
   */
  static async updateErrorStatus(
    id: string,
    status: "ACTIVE" | "RESOLVED" | "IGNORED" | "INVESTIGATING"
  ): Promise<Error> {
    try {
      return prisma.error.update({
        where: { id },
        data: { status },
      });
    } catch (error) {
      logger.error("Failed to update error status", {
        errorId: id,
        status,
        error,
      });
      throw error;
    }
  }

  /**
   * Get error statistics
   */
  static async getErrorStats(
    projectId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    try {
      // Total errors
      const totalErrors = await prisma.error.count({
        where: {
          projectId,
          firstSeen: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Errors by status
      const errorsByStatus = await prisma.error.groupBy({
        by: ["status"],
        where: {
          projectId,
          firstSeen: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
      });

      // Errors by environment
      const errorsByEnvironment = await prisma.error.groupBy({
        by: ["environment"],
        where: {
          projectId,
          firstSeen: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
      });

      // Errors by type (top 5)
      const errorsByType = await prisma.error.groupBy({
        by: ["type"],
        where: {
          projectId,
          type: { not: null },
          firstSeen: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
        orderBy: {
          _count: {
            id: "desc",
          },
        },
        take: 5,
      });

      return {
        totalErrors,
        errorsByStatus,
        errorsByEnvironment,
        errorsByType,
      };
    } catch (error) {
      logger.error("Failed to get error stats", { projectId, error });
      throw error;
    }
  }

  /**
   * Generate a fingerprint to identify duplicate errors
   */
  private static generateErrorFingerprint(errorData: any): string {
    // This is a simplified implementation - in production you'd want a more sophisticated algorithm
    const components = [
      errorData.message,
      errorData.source,
      errorData.error?.name,
      // Don't include line numbers as they might vary
    ];

    return components.filter(Boolean).join("|");
  }

  /**
   * Extract tags from error data
   */
  private static extractTags(errorData: any): { key: string; value: string }[] {
    const tags: { key: string; value: string }[] = [];

    // Add browser tag
    if (errorData.userAgent) {
      // This is simplified - in production you'd want proper user agent parsing
      const browserMatch = /Chrome|Firefox|Safari|Edge|Opera|MSIE|Trident/.exec(
        errorData.userAgent
      );
      if (browserMatch) {
        tags.push({ key: "browser", value: browserMatch[0] });
      }
    }

    // Add error type tag
    if (errorData.error?.name) {
      tags.push({ key: "errorType", value: errorData.error.name });
    }

    // Add environment tag
    tags.push({
      key: "environment",
      value: errorData.environment || "production",
    });

    // Add URL path as tag (just the path, not full URL)
    if (errorData.url) {
      try {
        const urlObj = new URL(errorData.url);
        const path = urlObj.pathname;
        if (path) {
          tags.push({ key: "path", value: path });
        }
      } catch (e) {
        // If URL parsing fails, just use the raw value
        tags.push({ key: "url", value: errorData.url });
      }
    }

    return tags;
  }

  /**
   * Get error trends over time
   */
  static async getErrorTrends(
    projectId?: string,
    days: number = 7
  ): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get counts by day
      const dailyErrorCounts = await prisma.$queryRaw`
        SELECT 
          DATE(timestamp) as date,
          COUNT(DISTINCT "errorId") as uniqueErrors,
          COUNT(*) as totalOccurrences
        FROM "ErrorOccurrence"
        INNER JOIN "Error" ON "Error"."id" = "ErrorOccurrence"."errorId"
        WHERE 
          "ErrorOccurrence"."timestamp" >= ${startDate} AND
          "ErrorOccurrence"."timestamp" <= ${endDate}
          ${
            projectId
              ? Prisma.sql`AND "Error"."projectId" = ${projectId}`
              : Prisma.empty
          }
        GROUP BY DATE(timestamp)
        ORDER BY date ASC
      `;

      return dailyErrorCounts;
    } catch (error) {
      logger.error("Failed to get error trends", { projectId, days, error });
      throw error;
    }
  }

  /**
   * Get list of unique user IDs affected by a specific error
   */
  static async getAffectedUsers(errorId: string): Promise<string[]> {
    try {
      const occurrences = await prisma.errorOccurrence.findMany({
        where: {
          errorId,
          userId: { not: null },
        },
        distinct: ["userId"],
        select: { userId: true },
      });

      return occurrences.map((o) => o.userId).filter(Boolean) as string[];
    } catch (error) {
      logger.error("Failed to get affected users", { errorId, error });
      throw error;
    }
  }

  /**
   * Bulk update error statuses
   */
  static async bulkUpdateStatus(
    errorIds: string[],
    status: "ACTIVE" | "RESOLVED" | "IGNORED" | "INVESTIGATING"
  ): Promise<number> {
    try {
      const result = await prisma.error.updateMany({
        where: {
          id: { in: errorIds },
        },
        data: { status },
      });

      return result.count;
    } catch (error) {
      logger.error("Failed to bulk update error status", {
        errorIds,
        status,
        error,
      });
      throw error;
    }
  }

  /**
   * Delete old error occurrences
   * Used for maintenance/cleanup
   */
  static async cleanupOldOccurrences(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.errorOccurrence.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      logger.info(`Cleaned up ${result.count} old error occurrences`);
      return result.count;
    } catch (error) {
      logger.error("Failed to clean up old occurrences", { daysToKeep, error });
      throw error;
    }
  }
}
