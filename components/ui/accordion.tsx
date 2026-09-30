"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CaretDown } from "@phosphor-icons/react";

interface AccordionContextType {
  openItems: string[];
  toggleItem: (value: string) => void;
  type: "single" | "multiple";
}

const AccordionContext = React.createContext<AccordionContextType | undefined>(undefined);

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
}

export function Accordion({
  type = "single",
  defaultValue,
  className,
  children,
  ...props
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>(() => {
    if (!defaultValue) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });

  const toggleItem = React.useCallback(
    (value: string) => {
      setOpenItems((prev) => {
        if (type === "single") {
          return prev.includes(value) ? [] : [value];
        } else {
          return prev.includes(value)
            ? prev.filter((item) => item !== value)
            : [...prev, value];
        }
      });
    },
    [type]
  );

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={cn("divide-y divide-[#E8E2D6]", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

const AccordionItemContext = React.createContext<{ value: string } | undefined>(undefined);

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AccordionItem({
  value,
  className,
  children,
  ...props
}: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={cn("border-b border-[#E8E2D6] last:border-b-0", className)} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps) {
  const accordionContext = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);

  if (!accordionContext || !itemContext) {
    throw new Error("AccordionTrigger must be used within Accordion and AccordionItem");
  }

  const isOpen = accordionContext.openItems.includes(itemContext.value);

  return (
    <button
      type="button"
      onClick={() => accordionContext.toggleItem(itemContext.value)}
      aria-expanded={isOpen}
      className={cn(
        "flex w-full items-center justify-between py-4 text-left text-sm font-semibold font-sans text-[#102038] hover:text-[#233B5F] transition-all cursor-pointer",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <CaretDown
        size={16}
        weight="bold"
        className={cn(
          "shrink-0 text-[#7E8B9B] transition-transform duration-200",
          isOpen && "rotate-180 text-[#102038]"
        )}
      />
    </button>
  );
}

export interface AccordionContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  const accordionContext = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);

  if (!accordionContext || !itemContext) {
    throw new Error("AccordionContent must be used within Accordion and AccordionItem");
  }

  const isOpen = accordionContext.openItems.includes(itemContext.value);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "overflow-hidden pb-4 pt-0 text-xs font-sans text-[#4A5568] leading-relaxed animate-in fade-in duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
