import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-semibold font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BBFA4] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#102038] text-[#FAF8F3] hover:bg-[#233B5F] active:bg-[#0A1424] shadow-xs",
        secondary:
          "bg-[#EBF7F4] text-[#1E4D40] border border-[#77CBB3] hover:bg-[#D6ECE6]",
        outline:
          "border border-[#E8E2D6] bg-[#FFFFFF] text-[#102038] hover:bg-[#FAF8F3] hover:border-[#102038]",
        ghost:
          "text-[#4A5568] hover:bg-[#FAF8F3] hover:text-[#102038]",
        link:
          "text-[#102038] underline-offset-4 hover:underline hover:text-[#5BBFA4]",
        destructive:
          "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-[11px]",
        lg: "h-11 px-6 text-sm font-semibold",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
