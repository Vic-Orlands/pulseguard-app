import { HugeiconsIcon } from "@hugeicons/react";
import { Activity01Icon, Alert01Icon, AlertCircleIcon, CancelCircleIcon, CheckmarkCircle01Icon, PlayCircleIcon, StopCircleIcon } from "@hugeicons/core-free-icons";

// SeverityIcon
export const getSeverityIcon = (severity: number) => {
  switch (severity) {
    case 50:
      return <HugeiconsIcon icon={CancelCircleIcon} className="w-4 h-4" />;
    case 40:
      return <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4" />;
    case 30:
      return <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4" />;
    default:
      return <HugeiconsIcon icon={Activity01Icon} className="w-4 h-4" />;
  }
};

// getSeverityColor
export const getSeverityColor = (severity: number) => {
  switch (severity) {
    case 50:
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case 40:
      return "bg-neutral-500/20 text-neutral-300 border-neutral-500/30";
    case 30:
      return "bg-neutral-500/20 text-neutral-300 border-neutral-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

// getTypeIcon
export const getTypeIcon = (type: string) => {
  switch (type) {
    case "initialization":
      return <HugeiconsIcon icon={PlayCircleIcon} className="w-5 h-5 text-neutral-200" />;
    case "shutdown":
      return <HugeiconsIcon icon={StopCircleIcon} className="w-5 h-5 text-red-400" />;
    case "error":
      return <HugeiconsIcon icon={AlertCircleIcon} className="w-5 h-5 text-red-400" />;
    default:
      return <HugeiconsIcon icon={Activity01Icon} className="w-5 h-5 text-neutral-200" />;
  }
};
