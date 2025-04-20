import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a UUID v4 using Web Crypto API
// export function generateUUID(): string {
//   // For browsers and Edge runtime
//   if (typeof crypto !== "undefined" && crypto.randomUUID) {
//     return crypto.randomUUID();
//   }

//   // Fallback for environments without crypto.randomUUID()
//   return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
//     const r = (Math.random() * 16) | 0;
//     const v = c === "x" ? r : (r & 0x3) | 0x8;
//     return v.toString(16);
//   });
// }

// Function to check for cloud-specific environment variables
export function isCloudEnvironment() {
  return (
    process.env.AWS_EXECUTION_ENV || // AWS Lambda/AWS ECS
    process.env.KUBERNETES_SERVICE_HOST || // Kubernetes
    process.env.AZURE_INSTANCE_METADATA || // Azure
    process.env.ALIBABA_CLOUD_ID || // Alibaba
    process.env.GCP_PROJECT // Google Cloud
  );
}
