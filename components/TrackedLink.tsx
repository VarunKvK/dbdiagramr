"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";

type Props = {
  href: string;
  event: string;
  params?: Record<string, string | number | boolean>;
  className?: string;
  children: ReactNode;
};

export default function TrackedLink({
  href,
  event,
  params,
  className,
  children,
}: Props) {
  return (
    <Link href={href} className={className} onClick={() => track(event, params)}>
      {children}
    </Link>
  );
}
