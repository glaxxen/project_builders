import { signOut } from "@/auth";
import { SignOut } from "@phosphor-icons/react/dist/ssr";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 text-xs font-sans font-medium text-[#4A5568] hover:text-[#102038] hover:bg-[#FAF8F3] border border-[#102038]/20 rounded-lg transition-colors cursor-pointer"
      >
        <SignOut size={15} weight="bold" />
        <span>Sign Out</span>
      </button>
    </form>
  );
}
