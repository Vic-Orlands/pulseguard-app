import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  LineChart,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  Line,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

// Sample error data - in a real app, you'd fetch this from your API
const errorTrendData = [
  {
    date: "2025-03-28",
    total: 12,
    typeError: 7,
    referenceError: 3,
    syntaxError: 2,
  },
  {
    date: "2025-03-29",
    total: 8,
    typeError: 4,
    referenceError: 3,
    syntaxError: 1,
  },
  {
    date: "2025-03-30",
    total: 15,
    typeError: 8,
    referenceError: 4,
    syntaxError: 3,
  },
  {
    date: "2025-03-31",
    total: 10,
    typeError: 5,
    referenceError: 3,
    syntaxError: 2,
  },
  {
    date: "2025-04-01",
    total: 7,
    typeError: 3,
    referenceError: 2,
    syntaxError: 2,
  },
  {
    date: "2025-04-02",
    total: 11,
    typeError: 6,
    referenceError: 3,
    syntaxError: 2,
  },
  {
    date: "2025-04-03",
    total: 9,
    typeError: 5,
    referenceError: 2,
    syntaxError: 2,
  },
  {
    date: "2025-04-04",
    total: 6,
    typeError: 3,
    referenceError: 2,
    syntaxError: 1,
  },
];

const errorByPage = [
  { name: "Home", errors: 15 },
  { name: "Products", errors: 32 },
  { name: "Checkout", errors: 24 },
  { name: "Profile", errors: 8 },
  { name: "Settings", errors: 5 },
];

const errorByType = [
  { name: "TypeError", value: 41 },
  { name: "ReferenceError", value: 22 },
  { name: "SyntaxError", value: 13 },
  { name: "NetworkError", value: 8 },
  { name: "OtherError", value: 6 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const ErrorTrends = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Error Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trend">
          <TabsList className="mb-4">
            <TabsTrigger value="trend">Trend</TabsTrigger>
            <TabsTrigger value="bypage">By Page</TabsTrigger>
            <TabsTrigger value="bytype">By Type</TabsTrigger>
          </TabsList>

          <TabsContent value="trend">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={errorTrendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#8884d8"
                    name="Total Errors"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="typeError"
                    stroke="#82ca9d"
                    name="Type Errors"
                  />
                  <Line
                    type="monotone"
                    dataKey="referenceError"
                    stroke="#ffc658"
                    name="Reference Errors"
                  />
                  <Line
                    type="monotone"
                    dataKey="syntaxError"
                    stroke="#ff8042"
                    name="Syntax Errors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="bypage">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={errorByPage}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="errors" fill="#8884d8" name="Errors" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="bytype">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={errorByType}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {errorByType.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} errors`, "Count"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ErrorTrends;
