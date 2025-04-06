// src/components/ErrorOverviewDashboard.tsx

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, BarChart, ResponsiveContainer, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import ErrorTrends from './error-trends';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Mock data - in a real app, you'd fetch this from your API
const errorSummary = {
  totalErrors: 84,
  uniqueErrors: 17,
  affectedUsers: 42,
  percentChange: 12.5,
};

const recentErrors = [
  { id: 'err-001', message: 'TypeError: Cannot read property \'length\' of undefined', count: 24, lastSeen: '2 minutes ago', url: '/products', status: 'active' },
  { id: 'err-002', message: 'ReferenceError: fetch is not defined', count: 18, lastSeen: '15 minutes ago', url: '/checkout', status: 'active' },
  { id: 'err-003', message: 'SyntaxError: Unexpected token < in JSON at position 0', count: 12, lastSeen: '1 hour ago', url: '/api/user', status: 'resolved' },
  { id: 'err-004', message: 'NetworkError: Failed to fetch', count: 8, lastSeen: '3 hours ago', url: '/api/products', status: 'investigating' },
];

const performanceData = [
  { time: '9:00', ttfb: 120, fcp: 350, lcp: 750 },
  { time: '10:00', ttfb: 140, fcp: 380, lcp: 800 },
  { time: '11:00', ttfb: 130, fcp: 360, lcp: 780 },
  { time: '12:00', ttfb: 150, fcp: 400, lcp: 820 },
  { time: '13:00', ttfb: 180, fcp: 450, lcp: 900 },
  { time: '14:00', ttfb: 160, fcp: 420, lcp: 850 },
  { time: '15:00', ttfb: 140, fcp: 380, lcp: 800 },
];

const ErrorOverviewDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 3, 1),
    to: new Date(),
  });

  return (
    <div className="space-y-4">
      {/* Header with date range picker */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">PulseGuard Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button>Refresh</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorSummary.totalErrors}</div>
            <p className={cn("text-xs mt-1", errorSummary.percentChange > 0 ? "text-red-500" : "text-green-500")}>
              {errorSummary.percentChange > 0 ? "+" : ""}{errorSummary.percentChange}% from previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorSummary.uniqueErrors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Affected Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorSummary.affectedUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4%</div>
            <p className="text-xs mt-1 text-red-500">+0.5% from previous period</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ErrorTrends />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Latest Errors</CardTitle>
              <CardDescription>Most recent errors detected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentErrors.map((error) => (
                  <div key={error.id} className="border-b pb-2 last:border-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate" title={error.message}>
                          {error.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {error.url} · {error.lastSeen}
                        </p>
                      </div>
                      <div className="ml-2">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          error.status === 'active' ? "bg-red-100 text-red-800" :
                          error.status === 'investigating' ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        )}>
                          {error.count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Web vital statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={performanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} ms`, '']} />
                <Legend />
                <Line type="monotone" dataKey="ttfb" stroke="#8884d8" name="Time to First Byte" />
                <Line type="monotone" dataKey="fcp" stroke="#82ca9d" name="First Contentful Paint" />
                <Line type="monotone" dataKey="lcp" stroke="#ffc658" name="Largest Contentful Paint" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Alert className="border-orange-200 bg-orange-50 text-orange-800">
        <AlertTitle>High Error Rate Detected</AlertTitle>
        <AlertDescription>
          The checkout page is experiencing an elevated error rate (5.2%) in the last hour.
          <Button variant="link" className="p-0 h-auto text-orange-800 underline">Investigate</Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ErrorOverviewDashboard;