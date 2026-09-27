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
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-sans font-medium text-[#7E8B9B] hover:text-[#102038] hover:bg-[#FAF8F3] border border-[#E8E2D6] rounded-md transition-colors cursor-pointer"
      >
        <SignOut size={14} weight="bold" />
        <span>Sign Out</span>
      </button>
    </form>
  );
}
