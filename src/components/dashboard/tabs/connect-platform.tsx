import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Database, Zap, AlertTriangle } from "lucide-react";

const ConnectPlatformPage = () => {
  const [copiedCode, setCopiedCode] = useState("");

  const copyToClipboard = async (
    text: string,
    id: React.SetStateAction<string>
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(""), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  interface CodeBlockProps {
    id: string;
    language?: string;
    children: string | string[];
  }

  const CodeBlock = ({ children, id, language = "bash" }: CodeBlockProps) => (
    <div className="relative group mb-6">
      <div className="flex items-center justify-between bg-gray-800 text-gray-100 px-4 py-2 rounded-t-lg border-b border-gray-700">
        <span className="text-sm font-mono text-gray-400">{language}</span>
        <button
          onClick={() =>
            copyToClipboard(
              Array.isArray(children) ? children.join("\n") : children,
              id
            )
          }
          className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
        >
          {copiedCode === id ? (
            <>
              <Check size={16} className="text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto">
        <code className="text-sm">{children}</code>
      </pre>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12">
      {/* Installation */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          📦 Installation
        </h3>
        <CodeBlock id="npm-install">npm install @pulseguard/sdk</CodeBlock>
      </div>

      {/* Usage */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          ⚙️ Usage
        </h3>

        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            1. Get your <strong>Project ID</strong> from the PulseGuard
            dashboard.
            <br />
            2. Wrap your root layout or app component:
          </p>
        </div>

        <CodeBlock id="usage-code" language="tsx">
          {`// app/layout.tsx or App.tsx

import { TelemetryProvider } from "@pulseguard/sdk";
export default function RootLayout({ children }) {
  return (
    <TelemetryProvider
      initialProjectId="your-project-id"
      issueTrackerUrl="https://yourcompany.atlassian.net" // optional
    >
      {children}
    </TelemetryProvider>
)}`}{" "}
        </CodeBlock>

        <div className="text-center py-4">
          <p className="text-lg text-green-400 font-semibold">
            That&apos;s it — you&apos;re done! ✅
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Installation Guide</h3>
        <div className="p-4 rounded-lg bg-gray-900/50">
          <Tabs defaultValue="nextjs" className="w-full">
            <TabsList className="bg-gray-800 border border-blue-900/40">
              <TabsTrigger value="nextjs">Next.js</TabsTrigger>
              <TabsTrigger value="nodejs">Node.js</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
            <div className="mt-4">
              <div className="space-y-3 text-sm">
                <p>1. Install the npm package:</p>
                <div className="p-3 rounded bg-gray-800 font-mono text-blue-400">
                  npm install @pulseguard/nextjs
                </div>
                <p>2. Initialize the client SDK in your Next.js application:</p>
                <div className="p-3 rounded bg-gray-800 font-mono text-blue-400">
                  {`// src/app/layout.tsx\nimport { PulseGuard } from '@pulseguard/nextjs/client';\n\nexport default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode\n}) {\n  return (\n    <html>\n      <body>\n        <PulseGuard projectId="digitalizing" />\n        {children}\n      </body>\n    </html>\n  )\n}`}
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {/* What It Does */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          ✅ What It Does
        </h3>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                Automatically captures:
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li>• Uncaught exceptions</li>
                <li>• Unhandled promise rejections</li>
                <li>
                  • Runtime{" "}
                  <code className="bg-gray-700 px-1 rounded text-sm">
                    console.error
                  </code>{" "}
                  logs
                </li>
                <li>• Core user events (e.g., navigation, clicks)</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="text-blue-500" size={20} />
                Enriches data with:
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li>• Browser & OS metadata</li>
                <li>• Project ID context</li>
                <li>• Optional issue tracker link</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-300 flex items-center gap-2">
              <Zap className="text-yellow-500" size={20} />
              Sends everything to the PulseGuard backend in real time
            </p>
          </div>
        </div>
      </div>

      {/* Props Table */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          🔐 Props for{" "}
          <code className="bg-gray-800 px-2 py-1 rounded text-sm">
            &lt;TelemetryProvider /&gt;
          </code>
        </h3>

        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-white font-semibold">
                  Prop
                </th>
                <th className="px-4 py-3 text-left text-white font-semibold">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-white font-semibold">
                  Required
                </th>
                <th className="px-4 py-3 text-left text-white font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-600">
                <td className="px-4 py-3 text-blue-400 font-mono text-sm">
                  initialProjectId
                </td>
                <td className="px-4 py-3 text-gray-300 font-mono text-sm">
                  string
                </td>
                <td className="px-4 py-3 text-green-400">✅</td>
                <td className="px-4 py-3 text-gray-300">
                  Your PulseGuard Project UUID
                </td>
              </tr>
              <tr className="border-t border-gray-600">
                <td className="px-4 py-3 text-blue-400 font-mono text-sm">
                  issueTrackerUrl
                </td>
                <td className="px-4 py-3 text-gray-300 font-mono text-sm">
                  string
                </td>
                <td className="px-4 py-3 text-gray-400">❌</td>
                <td className="px-4 py-3 text-gray-300">
                  Optional link to your company&apos;s issue tracker
                </td>
              </tr>
              <tr className="border-t border-gray-600">
                <td className="px-4 py-3 text-blue-400 font-mono text-sm">
                  initialUserId
                </td>
                <td className="px-4 py-3 text-gray-300 font-mono text-sm">
                  string
                </td>
                <td className="px-4 py-3 text-gray-400">❌</td>
                <td className="px-4 py-3 text-gray-300">
                  Optional user ID for enhanced session tracking
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Best Practices */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          🧠 Best Practices
        </h3>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">•</span>
              <span>
                Place{" "}
                <code className="bg-gray-700 px-1 rounded text-sm">
                  &lt;TelemetryProvider /&gt;
                </code>{" "}
                as high in your component tree as possible (e.g.,{" "}
                <code className="bg-gray-700 px-1 rounded text-sm">
                  _app.tsx
                </code>
                ,{" "}
                <code className="bg-gray-700 px-1 rounded text-sm">
                  layout.tsx
                </code>
                )
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">•</span>
              <span>
                Do <strong>not</strong> manually call error or event APIs —
                PulseGuard handles everything internally
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">•</span>
              <span>
                Use your dashboard to view telemetry, group issues, and link to
                tickets
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* OpenTelemetry */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          🧰 Powered by OpenTelemetry
        </h3>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-300">
            PulseGuard uses OpenTelemetry under the hood with custom transports
            and error enrichment.
          </p>
        </div>
      </div>

      {/* Privacy */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          🛡️ Privacy
        </h3>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-300">
            We don&apos;t collect PII unless you explicitly provide a{" "}
            <code className="bg-gray-700 px-1 rounded text-sm">userId</code>.
          </p>
        </div>
      </div>

      {/* Next.js Example */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          Next.js Example
        </h3>

        <CodeBlock id="nextjs-example" language="tsx">{`// pages/_app.tsx
import { TelemetryProvider } from "@pulseguard/sdk";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TelemetryProvider
      initialProjectId={process.env.NEXT_PUBLIC_PULSEGUARD_PROJECT_ID!}
      issueTrackerUrl="https://github.com/myorg/myproject/issues"
      initialUserId={pageProps.user?.id} // if available
    >
      <Component {...pageProps} />
    </TelemetryProvider>
  );
}`}</CodeBlock>

        <div className="mb-4">
          <h4 className="text-lg font-semibold text-white mb-2">
            Environment Variables
          </h4>
          <CodeBlock id="env-example" language="bash">{`# .env.local
NEXT_PUBLIC_PULSEGUARD_PROJECT_ID=your-project-id-from-dashboard`}</CodeBlock>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-8 border-t border-gray-700">
        <p className="text-gray-400">
          📄 <strong>License:</strong> MIT © PulseGuard
        </p>
      </div>
    </div>
  );
};

export default ConnectPlatformPage;
