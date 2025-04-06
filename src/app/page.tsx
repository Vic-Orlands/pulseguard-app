import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Header />

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
            better applications.
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
