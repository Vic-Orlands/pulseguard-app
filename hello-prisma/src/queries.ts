import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient().$extends(withAccelerate());

// A `main` function so that we can use async/await
async function main() {
  // Create a project
  const project = await prisma.project.create({
    data: {
      name: "Test Project",
      apiKey: `key_${Date.now()}`, // Generate a unique API key
    },
  });
  console.log(
    `Created project: ${project.name} with API key: ${project.apiKey}`
  );

  // Create errors for the project
  const error1 = await prisma.error.create({
    data: {
      message: "TypeError: Cannot read property 'length' of undefined",
      stack: "at Component (app.js:42:23)\nat renderFunction (react.js:234)",
      source: "app.js",
      type: "TypeError",
      url: "https://example.com/app",
      projectId: project.id,
      environment: "development",
      tags: {
        create: [
          { key: "browser", value: "Chrome" },
          { key: "version", value: "1.0.0" },
        ],
      },
    },
    include: {
      tags: true,
    },
  });

  const error2 = await prisma.error.create({
    data: {
      message: "Uncaught SyntaxError: Unexpected token",
      stack: "at parse (parser.js:24:12)",
      source: "parser.js",
      type: "SyntaxError",
      projectId: project.id,
      environment: "production",
      occurrences: {
        create: [
          {
            userId: "user123",
            sessionId: "session456",
            metadata: { page: "/dashboard", browser: "Firefox" },
          },
        ],
      },
    },
    include: {
      occurrences: true,
    },
  });

  console.log(
    `Created errors: "${error1.message}" and "${error2.message}" for project ${project.name}`
  );

  // Retrieve all errors from a specific project
  const allErrors = await prisma.error.findMany({
    where: { projectId: project.id },
    include: {
      tags: true,
      occurrences: true,
    },
  });
  console.log(`Retrieved all errors for project: ${project.name}`);
  console.log(`Total errors: ${allErrors.length}`);

  // Update an error status
  const updatedError = await prisma.error.update({
    where: {
      id: error1.id,
    },
    data: {
      status: "RESOLVED",
    },
  });
  console.log(
    `Updated error status: "${updatedError.message}" is now ${updatedError.status}`
  );

  // Create a user
  const user = await prisma.user.create({
    data: {
      name: "Error Monitor",
      email: `admin_${Date.now()}@errortracker.io`,
      password: "hashed_password_here", // In production, use proper password hashing
      role: "ADMIN",
    },
  });
  console.log(`Created user: ${user.name} (${user.email})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
