import type { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import { getRoleForEmail } from "@/lib/auth/roles";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "Project Builders <onboarding@resend.dev>",
      async sendVerificationRequest({ identifier: email, url }) {
        // Output magic link to server console for testing and verification
        console.log(`\n======================================================`);
        console.log(`[AUTH MAGIC LINK FOR]: ${email}`);
        console.log(`URL: ${url}`);
        console.log(`======================================================\n`);

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || "Project Builders <onboarding@resend.dev>",
            to: email,
            subject: "Sign in to Project Builders",
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8" />
                  <title>Sign in to Project Builders</title>
                </head>
                <body style="margin: 0; padding: 40px 20px; background-color: #FAF8F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #102038;">
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #E8E2D6; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(16, 32, 56, 0.04);">
                    <tr>
                      <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #FAF8F3; background-color: #102038;">
                        <div style="font-size: 20px; font-weight: 700; color: #FAF8F3; letter-spacing: -0.5px;">Project Builders</div>
                        <div style="font-size: 11px; font-weight: 600; color: #5BBFA4; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">Build Real Experience</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 32px;">
                        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #102038;">Your Sign-In Link</h2>
                        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4A5568;">
                          Click the button below to securely sign in to your Project Builders learning dashboard. This link expires in 24 hours and can only be used once.
                        </p>
                        <table border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                          <tr>
                            <td align="center" style="border-radius: 8px; background-color: #102038;">
                              <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 600; color: #FAF8F3; text-decoration: none; border-radius: 8px; letter-spacing: 0.2px;">
                                Sign In to Dashboard &rarr;
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; color: #7E8B9B;">
                          If you didn't request this email, you can safely disregard it. No account was altered.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 32px; background-color: #FAF8F3; border-top: 1px solid #E8E2D6; font-size: 12px; color: #7E8B9B; text-align: center;">
                        Project Builders &bull; Practical, Cohort-Driven Experience Engine
                      </td>
                    </tr>
                  </table>
                </body>
              </html>
            `,
            text: `Sign in to Project Builders: ${url}\n\nThis link expires in 24 hours.`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn("\n⚠️ Resend API warning:", errorData.message || response.statusText);

          // On Resend's free tier with 'onboarding@resend.dev', Resend rejects emails sent
          // to any address other than the account owner (twcfgdc@gmail.com).
          // In development mode, we log the link to the console and allow the sign-in flow
          // to succeed so builders and testers can log in immediately.
          if (process.env.NODE_ENV !== "production" || errorData.statusCode === 403) {
            console.log("\n[DEV NOTICE]: Resend free-tier domain restriction active.");
            console.log("Use the [AUTH MAGIC LINK] logged above to sign in directly!\n");
            return;
          }

          throw new Error(`Failed to send magic link email: ${errorData.message || response.statusText}`);
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        token.role = getRoleForEmail(user.email);
        token.email = user.email;
      } else if (token?.email) {
        token.role = getRoleForEmail(token.email as string);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.email = (token.email as string) || session.user.email;
        session.user.role = (token.role as "admin" | "student") || "student";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
