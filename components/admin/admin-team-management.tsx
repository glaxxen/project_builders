"use client";

import { useState, useTransition } from "react";
import {
  ShieldCheck,
  UserPlus,
  Copy,
  Check,
  EnvelopeSimple,
  UsersThree,
  LockKey,
  Trash,
  Sparkle,
} from "@phosphor-icons/react";
import { adminUpdateUserRoleAction } from "@/lib/actions/users";
import type { User } from "@/lib/db/schema";

interface AdminTeamManagementProps {
  configuredEnvEmails: string[];
  dbAdmins: User[];
  currentAdminEmail: string;
}

export function AdminTeamManagement({
  configuredEnvEmails,
  dbAdmins,
  currentAdminEmail,
}: AdminTeamManagementProps) {
  const [newEmail, setNewEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Combine unique admins
  const allAdminEmails = Array.from(
    new Set([
      ...configuredEnvEmails.map((e) => e.toLowerCase().trim()),
      ...dbAdmins.map((u) => u.email.toLowerCase().trim()),
    ])
  );

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes("@")) {
      setStatusMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    setStatusMessage(null);
    startTransition(async () => {
      try {
        const res = await adminUpdateUserRoleAction({
          email: newEmail.trim(),
          role: "admin",
        });
        setStatusMessage({ type: "success", text: res.message });
        setNewEmail("");
        setTimeout(() => setStatusMessage(null), 5000);
      } catch (err: unknown) {
        setStatusMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to grant admin access.",
        });
      }
    });
  };

  const handleRevoke = (email: string) => {
    if (configuredEnvEmails.map((e) => e.toLowerCase()).includes(email.toLowerCase())) {
      alert(
        `"${email}" is defined in server environment variables (ADMIN_EMAILS). To remove this administrator, remove their email from your .env.local / hosting environment settings.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to revoke Admin rights from ${email}? They will become a standard student.`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await adminUpdateUserRoleAction({
          email,
          role: "student",
        });
        setStatusMessage({ type: "success", text: res.message });
        setTimeout(() => setStatusMessage(null), 5000);
      } catch (err: unknown) {
        setStatusMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to revoke admin access.",
        });
      }
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div suppressHydrationWarning className="bg-[#FFFFFF] border-2 border-[#102038]/15 rounded-2xl p-6 sm:p-8 space-y-8 text-left shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#102038]/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#BA9C60]">
            <ShieldCheck size={16} weight="bold" />
            <span>Instructor &amp; Admin Access Control</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102038] tracking-tight">
            Administrator Team Permissions
          </h2>
          <p className="text-xs sm:text-sm font-sans font-normal text-[#102038]/70 max-w-2xl">
            Anyone listed below has full access to the Admin Console to view all student scores, grade submissions, allow exam retakes, and manage curriculum publishing.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-[#FAF8F3] border border-[#102038]/15 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#102038] shrink-0">
          <UsersThree size={18} weight="bold" className="text-[#5BBFA4]" />
          <span>{allAdminEmails.length} Active Administrators</span>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-sans font-medium flex items-center justify-between gap-3 ${
            statusMessage.type === "success"
              ? "bg-[#EBF7F4] text-[#1E4D40] border border-[#5BBFA4]/40"
              : "bg-[#FDF2F2] text-[#991B1B] border border-[#F87171]/40"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: Add Form + Admin Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Quick Add Form + Portal Sharing */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF8F3] border border-[#102038]/15 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#102038]">
              <UserPlus size={18} weight="bold" className="text-[#5BBFA4]" />
              <span>Grant Admin Access to Colleague</span>
            </div>
            <p className="text-xs font-sans font-normal text-[#102038]/70 leading-relaxed">
              Enter their email address. Once added, when they sign in, they will automatically be routed to the Admin Dashboard and can see all student scores.
            </p>

            <form suppressHydrationWarning onSubmit={handleAddAdmin} className="space-y-3 pt-1">
              <div>
                <label htmlFor="admin-email-input" className="block text-xs font-bold text-[#102038]/80 mb-1">
                  Instructor / Admin Email:
                </label>
                <div className="relative">
                  <EnvelopeSimple
                    size={16}
                    weight="bold"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#102038]/40"
                  />
                  <input
                    id="admin-email-input"
                    type="email"
                    suppressHydrationWarning
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. colleague@university.edu"
                    required
                    disabled={isPending}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#102038]/20 rounded-xl text-xs sm:text-sm font-sans font-normal text-[#102038] focus:outline-none focus:border-[#102038]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#102038] hover:bg-[#233B5F] active:bg-[#0A1424] text-white text-xs sm:text-sm font-sans font-semibold transition-all cursor-pointer disabled:opacity-60 shadow-sm"
              >
                <ShieldCheck size={16} weight="bold" />
                <span>{isPending ? "Granting Access..." : "Grant Administrator Access"}</span>
              </button>
            </form>
          </div>

          {/* Quick Share Links */}
          <div className="bg-[#FAF8F3] border border-[#102038]/15 rounded-xl p-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#102038]/60">
              Shareable Portal Links
            </div>
            <div className="space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-[#102038]/10">
                <span className="font-mono text-[11px] truncate text-[#102038]">
                  /dashboard/admin
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `${window.location.origin}/dashboard/admin`,
                      "standard"
                    )
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#102038] hover:text-[#5BBFA4] cursor-pointer shrink-0"
                >
                  {copiedLink === "standard" ? (
                    <>
                      <Check size={13} weight="bold" className="text-[#1E4D40]" />
                      <span className="text-[#1E4D40]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} weight="bold" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-[#102038]/10">
                <span className="font-mono text-[11px] truncate text-[#102038]">
                  /dashboard/admin?preview=admin
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `${window.location.origin}/dashboard/admin?preview=admin`,
                      "preview"
                    )
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#102038] hover:text-[#5BBFA4] cursor-pointer shrink-0"
                >
                  {copiedLink === "preview" ? (
                    <>
                      <Check size={13} weight="bold" className="text-[#1E4D40]" />
                      <span className="text-[#1E4D40]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} weight="bold" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Admin Roster */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-[#102038]">
              Active Administrators &amp; Instructors
            </h3>
            <span className="text-xs font-sans font-normal text-[#102038]/60">
              Real-time permissions
            </span>
          </div>

          <div className="border border-[#102038]/15 rounded-xl overflow-hidden divide-y divide-[#102038]/10">
            {allAdminEmails.map((email) => {
              const isEnvAdmin = configuredEnvEmails
                .map((e) => e.toLowerCase())
                .includes(email.toLowerCase());
              const isYou = email.toLowerCase() === currentAdminEmail.toLowerCase();
              const dbRecord = dbAdmins.find(
                (u) => u.email.toLowerCase() === email.toLowerCase()
              );

              return (
                <div
                  key={email}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-[#FAF8F3]/60 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm sm:text-base font-bold text-[#102038] font-sans">
                        {dbRecord?.name || email.split("@")[0]}
                      </strong>
                      {isYou && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#102038] bg-[#FAF8F3] border border-[#102038]/20 px-2 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-mono text-[#102038]/70 flex items-center gap-2">
                      <EnvelopeSimple size={13} weight="bold" />
                      <span>{email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0">
                    {isEnvAdmin ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[#8C6D23] bg-[#FDF8ED] border border-[#BA9C60]/40 px-3 py-1 rounded-lg">
                        <LockKey size={13} weight="bold" />
                        <span>Master Admin (Env)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[#1E4D40] bg-[#EBF7F4] border border-[#5BBFA4]/40 px-3 py-1 rounded-lg">
                        <Sparkle size={13} weight="fill" className="text-[#5BBFA4]" />
                        <span>Admin (Database)</span>
                      </span>
                    )}

                    {!isEnvAdmin && !isYou && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(email)}
                        disabled={isPending}
                        className="text-xs font-sans font-medium text-[#B91C1C] hover:text-[#7F1D1D] hover:underline p-1.5 cursor-pointer inline-flex items-center gap-1"
                        title="Demote to Student"
                      >
                        <Trash size={14} weight="bold" />
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Configuration Note */}
          <div className="bg-[#FAF8F3] border border-[#102038]/10 rounded-xl p-4 text-xs font-sans font-normal text-[#102038]/70 space-y-1">
            <div className="font-bold text-[#102038]">
              Permanent Environment Configuration:
            </div>
            <p>
              To permanently make someone an admin across restarts and deployments, add their email to the comma-separated list in <code className="bg-white px-1.5 py-0.5 rounded border border-[#102038]/10 font-mono">ADMIN_EMAILS</code> in your <code className="bg-white px-1.5 py-0.5 rounded border border-[#102038]/10 font-mono">.env.local</code> or hosting dashboard (e.g. Vercel).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
