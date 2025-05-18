"use client";

import { motion } from "framer-motion";
import Head from "next/head";
import { Footer, Navbar } from "../page";
import AnimatedBackground from "@/components/background-color";

export default function PricingPage() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />

      <div className="relative min-h-screen overflow-hidden">
        <Head>
          <title>ErrorTrack Pro | Pricing</title>
        </Head>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-full opacity-20"
            animate={{
              background: [
                "radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 20%)",
                "radial-gradient(circle at 90% 30%, rgba(236, 72, 153, 0.2) 0%, transparent 20%)",
                "radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 20%)",
                "radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 20%)",
              ],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Animated circuit-like lines */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute border border-indigo-400/20 rounded-full"
              style={{
                width: `${Math.random() * 300 + 100}px`,
                height: `${Math.random() * 300 + 100}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                rotate: Math.random() * 360,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Moving light */}
          <motion.div
            className="absolute w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-10"
            animate={{
              x: ["-10%", "110%", "-10%"],
              y: ["20%", "80%", "20%"],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Pricing that grows with you
            </motion.h1>
            <motion.p
              className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Only pay for what you use. Your first 10,000 errors tracked are
              free.
            </motion.p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Free Plan */}
            <motion.div
              className="relative bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="p-8">
                <h2 className="text-2xl font-bold text-white">Starter</h2>
                <p className="mt-2 text-gray-300">
                  Perfect for side projects and small apps
                </p>

                <div className="mt-6">
                  <p className="text-4xl font-bold text-white">$0</p>
                  <p className="mt-2 text-gray-300">forever</p>
                </div>

                <div className="mt-8">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-pink-500" />
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-300">
                        1,000 errors/month
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-300">
                        Basic error tracking
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-300">
                        Email notifications
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-300">1 project</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="px-8 pb-8">
                <button className="w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600 transition duration-150">
                  Get started for free
                </button>
              </div>
            </motion.div>

            {/* Pro Plan - Featured */}
            <motion.div
              className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl overflow-hidden border border-indigo-500/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-pink-500 opacity-20 blur-3xl"></div>
              <div className="p-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Pro</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-500 text-white">
                    Most popular
                  </span>
                </div>
                <p className="mt-2 text-gray-300">
                  For growing applications and teams
                </p>

                <div className="mt-6">
                  <p className="text-4xl font-bold text-white">$25</p>
                  <p className="mt-2 text-gray-300">per month</p>
                </div>

                <div className="mt-8">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-pink-500" />
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-300">
                        10,000 errors/month
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-300">
                        Advanced error grouping
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-300">
                        Slack & Discord integration
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-300">5 team members</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-300">
                        Error trends & analytics
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="px-8 pb-8">
                <button className="w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 transition duration-150">
                  Start 14-day trial
                </button>
              </div>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              className="relative bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="p-8">
                <h2 className="text-2xl font-bold text-white">Enterprise</h2>
                <p className="mt-2 text-gray-300">
                  For large-scale applications
                </p>

                <div className="mt-6">
                  <p className="text-4xl font-bold text-white">Custom</p>
                  <p className="mt-2 text-gray-300">tailored to your needs</p>
                </div>

                <div className="mt-8">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-pink-500" />
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-300">
                        Unlimited errors
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-300">
                        Priority support
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-300">
                        SAML/SSO integration
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-300">
                        Custom retention policies
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-300">
                        Dedicated infrastructure
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="px-8 pb-8">
                <button className="w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600 transition duration-150">
                  Contact sales
                </button>
              </div>
            </motion.div>
          </div>

          {/* Add-ons Section */}
          <motion.div
            className="mt-16 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white">
              Enhanced Security Add-ons
            </h2>
            <p className="mt-2 text-gray-300">
              Additional features for enterprise-grade security
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: "Multi-factor Auth",
                  price: "$50/mo",
                  features: ["TOTP", "Backup codes", "SMS verification"],
                },
                {
                  name: "Device Tracking",
                  price: "$30/mo",
                  features: [
                    "Device fingerprinting",
                    "Revocation",
                    "Geo-tracking",
                  ],
                },
                {
                  name: "Custom Domains",
                  price: "$25/mo",
                  features: [
                    "Branded error pages",
                    "White-labeling",
                    "Custom SSL",
                  ],
                },
                {
                  name: "Enterprise SSO",
                  price: "$100/mo",
                  features: ["SAML 2.0", "OAuth 2.0", "SCIM provisioning"],
                },
              ].map((addon, index) => (
                <div
                  key={index}
                  className="bg-gray-700/50 rounded-xl p-6 border border-gray-600"
                >
                  <h3 className="text-lg font-medium text-white">
                    {addon.name}
                  </h3>
                  <p className="mt-1 text-indigo-400">{addon.price}</p>
                  <ul className="mt-4 space-y-2">
                    {addon.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="ml-2 text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white">
              Frequently asked questions
            </h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {[
                {
                  question: "What counts as an 'error'?",
                  answer:
                    "Each unique error occurrence in your application counts as one error. We group similar errors together to help you identify patterns.",
                },
                {
                  question: "Can I change plans later?",
                  answer:
                    "Yes, you can upgrade, downgrade, or cancel at any time with no penalties.",
                },
                {
                  question: "Is there a free trial?",
                  answer:
                    "Yes, all paid plans come with a 14-day free trial. No credit card required.",
                },
                {
                  question: "How is billing handled?",
                  answer:
                    "We bill monthly based on your usage. You can set usage alerts to monitor your consumption.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
                >
                  <h3 className="text-lg font-medium text-white">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-gray-300">{item.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  );
}
