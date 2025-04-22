import Link from "next/link";
import Image from "next/image";
import { HeartPulse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <nav className="bg-white">
        <section className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* <div className="w-8 h-8 bg-emerald-500 rounded-md"></div> */}
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <span className="w-5 h-5 flex items-center justify-center mr-1">
                <HeartPulse className="text-emerald-500" />
              </span>
              PulseGuard
            </h2>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-slate-700 hover:text-emerald-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-slate-700 hover:text-emerald-600 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#docs"
              className="text-slate-700 hover:text-emerald-600 transition-colors"
            >
              Documentation
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/sign-in" className="hidden md:inline-flex" passHref>
              <Button className="cursor-pointer md:inline-flex bg-transparent shadow-none text-emerald-950 hover:text-emerald-600 border-none">
                Sign In
              </Button>
            </Link>
            <Button className="bg-emerald-500 cursor-pointer hover:bg-emerald-600 text-emerald-950">
              Get Started
            </Button>
          </div>
        </section>
      </nav>

      <section className="relative w-full h-screen bg-gradient-to-b from-white via-[#D8C1FF] to-[#A0C4FF] overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_10%,transparent_50%)] opacity-30 pointer-events-none" />

        {/* Semi-Circles */}
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="relative w-[80%] h-[80%] flex justify-center items-center">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`absolute w-full h-full border border-white/20 rounded-full opacity-${
                  10 + i * 5
                }`}
                style={{
                  width: `${50 + i * 20}%`,
                  height: `${50 + i * 20}%`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative text-center mb-8 pt-20">
          <Badge className="mb-4 bg-emerald-500 text-emerald-950">
            Announcing our new product
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Intelligent Error Tracking & Monitoring
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-4">
            Track errors, session replays, and performance metrics of your
            application easily – and move from answering tickets to building
            better applications with PulseGuard
          </p>
          <div className="flex justify-center">
            <Button className="h-10 bg-emerald-500 text-emerald-950 hover:bg-emerald-600">
              See PauseGuard in action
            </Button>
          </div>
        </div>

        {/* Dashboard Image */}
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-xl transform -rotate-1"></div>
          <div className="relative bg-white p-2 rounded-xl shadow-2xl">
            {/* This would be your actual dashboard image */}
            <div className="aspect-[16/9] bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
              <Image
                src="/api/placeholder/1200/675"
                alt="ErrorSense Dashboard"
                className="w-full h-auto"
                width={100}
                height={100}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="bg-gradient-to-b from-[#A0C4FF] via-[#A0C4FF] to-[#e4d5ff] py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Core Features of PulseGuard
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Error Monitoring and Tracking
              </h3>
              <p className="text-slate-600">
                Track errors in real-time with detailed stack traces and context
                to quickly identify and fix issues.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Session Replays</h3>
              <p className="text-slate-600">
                Watch user sessions to understand exactly what happened before
                an error occurred.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Alert Management</h3>
              <p className="text-slate-600">
                Set up custom alerts and get notified through your preferred
                channels when issues arise.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-driven Insights</h3>
              <p className="text-slate-600">
                Get intelligent recommendations and pattern analysis to prevent
                recurring issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-b from-[#e4d5ff] to-white mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          How PulseGuard Works
        </h2>

        <div className="px-36 mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* Step 1 */}
            <div className="flex-1 mt-8">
              <div className="bg-slate-300 rounded-lg p-1 w-full mb-6">
                <div className="aspect-video bg-white rounded overflow-hidden flex items-center justify-center">
                  <Image
                    src="/api/placeholder/400/400"
                    alt="Integration"
                    className="w-full h-auto"
                    width={400}
                    height={300}
                  />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">1. Easy Integration</h3>
                <p className="text-slate-500 mb-4">
                  Add our lightweight SDK to your application with just a few
                  lines of code. We support all major frameworks and languages.
                </p>
                <div className="bg-emerald-600  rounded-lg p-4">
                  <code className="text-sm font-mono text-emerald-950">
                    npm install @errorsense/sdk
                  </code>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex-1 mt-8">
              <div className="bg-slate-300 rounded-lg p-1 w-full mb-6">
                <div className="aspect-video bg-white rounded overflow-hidden flex items-center justify-center">
                  <Image
                    src="/api/placeholder/400/400"
                    alt="Dashboard"
                    className="w-full h-auto"
                    width={400}
                    height={300}
                  />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">
                  2. Monitor Performance
                </h3>
                <p className="text-slate-500">
                  Gain immediate visibility into your application&apos;s
                  performance and error rates through our intuitive dashboard.
                </p>
                <ul className="list-disc list-inside text-slate-500 mt-4">
                  <li>Real-time error tracking</li>
                  <li>Performance metrics</li>
                  <li>User session data</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex-1 mt-8">
              <div className="bg-slate-300 rounded-lg p-1 w-full mb-6">
                <div className="aspect-video bg-white rounded overflow-hidden flex items-center justify-center">
                  <Image
                    src="/api/placeholder/400/400"
                    alt="AI Insights"
                    className="w-full h-auto"
                    width={400}
                    height={300}
                  />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">
                  3. Get AI-Powered Insights
                </h3>
                <p className="text-slate-500 mb-4">
                  Our AI analyzes error patterns, identifies root causes, and
                  suggests optimizations to improve your application.
                </p>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-emerald-950">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-white via-[#D8C1FF] to-[#A0C4FF] mx-auto px-4 py-16 md:py-24">
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-2xl p-8 md:p-12 text-center text-white max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to build better applications?
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Join thousands of developers who are spending less time debugging
            and more time building.
          </p>
          <div className="flex justify-center gap-4">
            <Button className="h-10 bg-emerald-500 text-emerald-950 hover:bg-emerald-600">
              See PauseGuard in action
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center space-x-2 mb-4">
              <HeartPulse className="text-emerald-500" />
              <span className="text-xl font-bold">PulseGuard</span>
            </div>
            <p className="text-slate-400 max-w-xs">
              Intelligent error tracking and monitoring for modern applications.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 mb-4 md:mb-0">
            © 2025 ErrorSense. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Twitter</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <span className="sr-only">GitHub</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <span className="sr-only">LinkedIn</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
