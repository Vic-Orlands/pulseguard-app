import { HeartPulse } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

function Header() {
  return (
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
  );
}

export default Header;
