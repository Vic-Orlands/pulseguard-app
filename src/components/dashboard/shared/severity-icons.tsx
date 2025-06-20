import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlayCircle,
  StopCircle,
  AlertCircle,
} from "lucide-react";

// SeverityIcon
export const getSeverityIcon = (severity: number) => {
  switch (severity) {
    case 50:
      return <XCircle className="w-4 h-4" />;
    case 40:
      return <AlertTriangle className="w-4 h-4" />;
    case 30:
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

// getSeverityColor
export const getSeverityColor = (severity: number) => {
  switch (severity) {
    case 50:
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case 40:
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case 30:
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

// getTypeIcon
export const getTypeIcon = (type: string) => {
  switch (type) {
    case "initialization":
      return <PlayCircle className="w-5 h-5 text-green-400" />;
    case "shutdown":
      return <StopCircle className="w-5 h-5 text-red-400" />;
    case "error":
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    default:
      return <Activity className="w-5 h-5 text-blue-400" />;
  }
};
