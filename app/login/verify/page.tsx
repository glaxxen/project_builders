import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";

export default function VerifyRequestPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FAF8F3] text-[#102038] flex flex-col justify-between p-6 sm:p-10 lg:p-14 select-none">
      {/* Top Header Micro-Bar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-mono text-[#7E8B9B] hover:text-[#102038] transition-colors"
        >
          <ArrowLeft size={14} weight="bold" />
          <span className="w-2 h-2 rounded-full bg-[#5BBFA4]" />
          <span className="font-semibold text-[#102038]">Project Builders</span>
          <span>/</span>
          <span>Check Email</span>
        </Link>

        <div className="text-[11px] font-mono uppercase tracking-widest text-[#7E8B9B]">
          Build Real Experience
        </div>
      </header>

      {/* Centerpiece Confirmation Box */}
      <main className="w-full max-w-md mx-auto my-auto">
        <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-2xl p-8 sm:p-10 shadow-[0_2px_12px_rgba(16,32,56,0.06)] text-center space-y-6">
          {/* Brand Insignia & Check Icon */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative w-16 h-16 rounded-xl bg-[#EBF7F4] border border-[#77CBB3] p-2 flex items-center justify-center text-[#1E4D40]">
              <EnvelopeSimple size={32} weight="bold" />
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#5BBFA4] text-[#FAF8F3] flex items-center justify-center border-2 border-[#FFFFFF]">
                <CheckCircle size={14} weight="fill" />
              </div>
            </div>

            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-[#102038]">
                Check Your Email
              </h1>
              <p className="text-xs uppercase tracking-widest font-mono font-semibold text-[#5BBFA4] mt-1">
                Magic Link Dispatched
              </p>
            </div>
          </div>

          <p className="text-sm font-sans text-[#4A5568] leading-relaxed">
            We sent a single-use sign-in link to your email address. Click the link in your message to access your dashboard immediately.
          </p>

          <div className="p-3.5 rounded-lg bg-[#FAF8F3] border border-[#E8E2D6] text-xs font-mono text-[#7E8B9B]">
            This link is valid for 24 hours and expires after first use.
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-sans font-semibold text-[#102038] hover:bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg transition-colors"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Status Footer */}
      <footer className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-[#7E8B9B] pt-4 border-t border-[#E8E2D6]">
        <div>© {new Date().getFullYear()} Project Builders.</div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-[#1E4D40] bg-[#EBF7F4] px-2 py-0.5 rounded font-semibold">
            Deterministic Engine
          </span>
          <span>•</span>
          <span>Next.js 15</span>
        </div>
      </footer>
    </div>
  );
}
