import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("space-y-1.5", className)} {...props} />;
  }
);
FormItem.displayName = "FormItem";

export interface FormLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-xs font-mono font-semibold text-[#102038] tracking-tight",
          className
        )}
        {...props}
      />
    );
  }
);
FormLabel.displayName = "FormLabel";

export interface FormDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  FormDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-[11px] font-sans text-[#7E8B9B]", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

export interface FormMessageProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: string | null;
}

export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  FormMessageProps
>(({ className, children, error, ...props }, ref) => {
  const content = error || children;
  if (!content) return null;

  return (
    <p
      ref={ref}
      className={cn("text-[11px] font-sans text-red-600 font-medium", className)}
      {...props}
    >
      {content}
    </p>
  );
});
FormMessage.displayName = "FormMessage";
