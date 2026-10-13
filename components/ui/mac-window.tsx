import { cn } from "@/lib/utils";

interface MacWindowProps {
  children: React.ReactNode;
  url?: string;
  className?: string;
}

export function MacWindow({ children, url, className }: MacWindowProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] border border-border bg-white shadow-lg",
        className
      )}
    >
      <div className="flex h-11 items-center justify-between border-b border-border bg-surface px-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        {url && (
          <div className="rounded-full border border-border bg-white px-3 py-1 font-mono text-xs font-medium text-muted">
            {url}
          </div>
        )}
        <div className="w-16" />
      </div>
      <div className="bg-white">{children}</div>
    </div>
  );
}

export default MacWindow;
