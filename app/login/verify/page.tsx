import Link from "next/link";
import { ArrowLeft, CheckCircle, EnvelopeSimple, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { verificationTokens } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export default async function VerifyRequestPage() {
  let devMagicLink: string | null = null;
  let devEmail: string | null = null;

  if (process.env.NODE_ENV !== "production") {
    try {
      const [latest] = await db
        .select()
        .from(verificationTokens)
        .orderBy(desc(verificationTokens.expires))
        .limit(1);

      if (latest && new Date(latest.expires) > new Date()) {
        devEmail = latest.identifier;
        devMagicLink = `/api/auth/callback/resend?callbackUrl=${encodeURIComponent("/dashboard")}&token=${latest.token}&email=${encodeURIComponent(latest.identifier)}`;
      }
    } catch (err) {
      console.error("Could not fetch dev magic link:", err);
    }
  }

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
            If you signed up with your registered Resend account (<span className="font-semibold text-[#102038]">twcfgdc@gmail.com</span>), a real magic link was sent to your inbox.
          </p>

          {/* Dev Instant Sign-In One-Click Action */}
          {devMagicLink && (
            <div className="p-4 rounded-xl bg-[#FAF8F3] border-2 border-[#5BBFA4] text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#1E4D40] uppercase tracking-wider">
                  <Sparkle size={14} weight="fill" className="text-[#5BBFA4]" />
                  <span>Dev Mode Instant Sign-In</span>
                </div>
                <span className="text-[10px] font-mono bg-[#EBF7F4] text-[#1E4D40] px-2 py-0.5 rounded font-semibold">
                  Local Active
                </span>
              </div>
              <p className="text-xs font-sans text-[#4A5568] leading-normal">
                Because Resend&apos;s free sandbox restricts real delivery to the account owner until a custom domain is verified, click below to log in directly:
              </p>
              <a
                href={devMagicLink}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-sans font-semibold text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] active:bg-[#0A1424] rounded-lg transition-colors shadow-sm text-center"
              >
                <span>Sign In as {devEmail} &rarr;</span>
              </a>
            </div>
          )}

          <div className="p-3.5 rounded-lg bg-[#FAF8F3] border border-[#E8E2D6] text-xs font-mono text-[#7E8B9B]">
            This link is valid for 24 hours and expires after first use.
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-sans font-medium text-[#102038] hover:bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg transition-colors"
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
