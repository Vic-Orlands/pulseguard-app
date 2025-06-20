import { motion } from "motion/react";

function Architecture() {
  return (
    <div className="relative p-8">
      {/* Diagram Legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-indigo-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-300">Error Data Flow</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-300">Log Data Flow</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-300">Trace Data Flow</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-300">Metric Data Flow</span>
        </div>
      </div>

      {/* Application Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1"></div>
        <motion.div
          className="bg-indigo-500/20 p-4 rounded-lg border border-indigo-400 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="w-16 h-16 mx-auto mb-2 bg-indigo-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-white font-medium">Application</p>
          <p className="text-gray-300 text-sm mt-1">
            Node.js, Python, Go, etc.
          </p>
        </motion.div>
        <div className="col-span-1"></div>
      </div>

      {/* Agent Collection Row */}
      <div className="flex justify-center mb-8">
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Animated connection */}
          <motion.svg
            width="200"
            height="60"
            viewBox="0 0 200 60"
            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.path
              d="M100,0 Q100,30 100,60"
              fill="none"
              stroke="url(#indigoGradient)"
              strokeWidth="2"
              strokeDasharray="8 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
              }}
            />
            <defs>
              <linearGradient
                id="indigoGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </motion.svg>

          <div className="bg-pink-500/20 p-4 rounded-lg border border-pink-400 text-center">
            <div className="w-16 h-16 mx-auto mb-2 bg-pink-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <p className="text-white font-medium">PulseGuard Agent</p>
            <p className="text-gray-300 text-sm mt-1">
              OTel Collector + Custom Processor
            </p>
          </div>
        </motion.div>
      </div>

      {/* Processing Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="bg-green-500/20 p-4 rounded-lg border border-green-400"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-start mb-3">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex-shrink-0 flex items-center justify-center mr-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Log Processing</p>
              <p className="text-gray-300 text-sm">
                Structured log ingestion & enrichment
              </p>
            </div>
          </div>
          <div className="pl-15">
            <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
              <li>Parse and normalize log formats</li>
              <li>Extract error signatures</li>
              <li>Correlate with deployment metadata</li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          className="bg-yellow-500/20 p-4 rounded-lg border border-yellow-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex items-start mb-3">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex-shrink-0 flex items-center justify-center mr-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Trace Processing</p>
              <p className="text-gray-300 text-sm">
                Distributed trace analysis
              </p>
            </div>
          </div>
          <div className="pl-15">
            <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
              <li>Extract error spans from traces</li>
              <li>Calculate error propagation paths</li>
              <li>Identify root cause services</li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          className="bg-red-500/20 p-4 rounded-lg border border-red-400"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex items-start mb-3">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex-shrink-0 flex items-center justify-center mr-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Metric Processing</p>
              <p className="text-gray-300 text-sm">Error rate calculations</p>
            </div>
          </div>
          <div className="pl-15">
            <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
              <li>Calculate error rates per service</li>
              <li>Track error burst detection</li>
              <li>Correlate with system metrics</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Storage Layer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="bg-green-500/10 p-4 rounded-lg border border-green-400/30 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="w-16 h-16 mx-auto mb-2 bg-green-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-white font-medium">Loki</p>
          <p className="text-gray-300 text-sm">Log Storage</p>
          <div className="mt-3 h-1 bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0"></div>
        </motion.div>

        <motion.div
          className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-400/30 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="w-16 h-16 mx-auto mb-2 bg-yellow-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <p className="text-white font-medium">Tempo</p>
          <p className="text-gray-300 text-sm">Trace Storage</p>
          <div className="mt-3 h-1 bg-gradient-to-r from-yellow-500/0 via-yellow-500 to-yellow-500/0"></div>
        </motion.div>

        <motion.div
          className="bg-red-500/10 p-4 rounded-lg border border-red-400/30 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <div className="w-16 h-16 mx-auto mb-2 bg-red-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-white font-medium">Prometheus</p>
          <p className="text-gray-300 text-sm">Metric Storage</p>
          <div className="mt-3 h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0"></div>
        </motion.div>
      </div>

      {/* Data Flow Animation */}
      <div className="relative h-52 flex flex-col items-center justify-center">
        {/* Animated connection lines */}
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 800 200"
          className="absolute top-0 left-0"
        >
          {/* Loki connection - from left to center bottom */}
          <motion.path
            d="M150,20 Q400,100 400,180"
            fill="none"
            stroke="url(#greenGradient)"
            strokeWidth="2"
            strokeDasharray="8 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              delay: 1.0,
              duration: 2,
              ease: "easeInOut",
            }}
          />

          {/* Tempo connection - from center top to center bottom */}
          <motion.path
            d="M400,20 Q400,100 400,180"
            fill="none"
            stroke="url(#yellowGradient)"
            strokeWidth="2"
            strokeDasharray="8 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              delay: 1.2,
              duration: 2,
              ease: "easeInOut",
            }}
          />

          {/* Prometheus connection - from right to center bottom */}
          <motion.path
            d="M650,20 Q400,100 400,180"
            fill="none"
            stroke="url(#redGradient)"
            strokeWidth="2"
            strokeDasharray="8 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              delay: 1.4,
              duration: 2,
              ease: "easeInOut",
            }}
          />

          <defs>
            <linearGradient
              id="greenGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient
              id="yellowGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>

      {/* Dashboard Visualization */}
      <motion.div
        className="bg-blue-500/20 p-6 rounded-lg border border-blue-400 text-center mx-auto max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.6, duration: 0.5 }}
      >
        <div className="w-20 h-20 mx-auto mb-4 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-white font-medium text-xl">PulseGuard Dashboard</p>
        <p className="text-gray-300 mt-2">
          Unified error visualization & alerting
        </p>

        {/* Mini dashboard preview */}
        <div className="mt-4 bg-gray-900 rounded p-3">
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="bg-blue-500/20 h-8 rounded"></div>
            <div className="bg-blue-500/20 h-8 rounded"></div>
            <div className="bg-blue-500/20 h-8 rounded"></div>
          </div>
          <div className="bg-gray-800 h-24 rounded-md relative overflow-hidden">
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-500"
              style={{ height: "60%" }}
              animate={{ height: ["60%", "30%", "45%", "60%"] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-red-500 to-pink-500"
              style={{ height: "20%" }}
              animate={{ height: ["20%", "40%", "15%", "20%"] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1,
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Architecture;
