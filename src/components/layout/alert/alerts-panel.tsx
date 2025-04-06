import React from "react";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type IProps = {
  type: string;
  time: string;
  isNew: boolean;
  message: string;
};

const AlertItem = ({ type, message, time, isNew }: IProps) => {
  let Icon, colorClass, bgClass;

  switch (type) {
    case "warning":
      Icon = AlertTriangle;
      colorClass = "text-accent-yellow";
      bgClass = "bg-accent-yellow bg-opacity-10";
      break;
    case "info":
      Icon = Info;
      colorClass = "text-accent-blue";
      bgClass = "bg-accent-blue bg-opacity-10";
      break;
    case "success":
      Icon = CheckCircle;
      colorClass = "text-accent-green";
      bgClass = "bg-accent-green bg-opacity-10";
      break;
    default:
      Icon = Info;
      colorClass = "text-accent-blue";
      bgClass = "bg-accent-blue bg-opacity-10";
  }

  return (
    <div className={`py-3 mb-2 rounded-md ${bgClass} flex items-start`}>
      <div className={`mr-3 pt-0.5 ${colorClass}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-text-primary font-medium">{message}</span>
          {isNew && (
            <span className="text-xs bg-accent-red px-1.5 py-0.5 rounded-full text-white">
              New
            </span>
          )}
        </div>
        <div className="text-text-tertiary text-xs">{time}</div>
      </div>
    </div>
  );
};

const AlertsPanel = () => {
  const alerts = [
    {
      type: "warning",
      message: "Conversion rate dropped by 25%",
      time: "5 minutes ago",
      isNew: true,
    },
    {
      type: "info",
      message: "New version available for deployment",
      time: "45 minutes ago",
      isNew: false,
    },
    {
      type: "success",
      message: "User milestone reached: 10,000 users",
      time: "2 hours ago",
      isNew: false,
    },
    {
      type: "warning",
      message: "Server load approaching 90% capacity",
      time: "3 hours ago",
      isNew: false,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent Alerts</CardTitle>
        <Button variant="outline">View all</Button>
      </CardHeader>

      <CardContent>
        {alerts.map((alert, index) => (
          <AlertItem
            key={index}
            type={alert.type}
            message={alert.message}
            time={alert.time}
            isNew={alert.isNew}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
