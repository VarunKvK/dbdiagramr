import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Small components from the Figma design language:
 * green pill buttons (radius 10), outlined buttons, and meta pills
 * (date · read time · table count, radius 20, 12px medium).
 */

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-xs font-medium transition-colors min-h-[44px]";

export function GreenButton({
  href,
  onClick,
  children,
  className,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const cls = cn(btnBase, "bg-accent text-white hover:bg-accent-hover", className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function OutlineButton({
  href,
  onClick,
  children,
  className,
  external = false,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  const cls = cn(
    btnBase,
    "border border-accent bg-transparent text-accent hover:bg-accent-soft",
    className
  );
  if (href) {
    return (
      <Link
        href={href}
        className={cls}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function MetaPill({
  children,
  solid = false,
  className,
}: {
  children: React.ReactNode;
  solid?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[20px] px-3 py-1 font-mono text-xs font-medium",
        solid ? "bg-accent text-white" : "border border-accent text-accent",
        className
      )}
    >
      {children}
    </span>
  );
}
