import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
