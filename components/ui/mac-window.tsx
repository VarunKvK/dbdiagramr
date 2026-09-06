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
        "overflow-hidden rounded-2xl border border-border bg-white shadow-sm",
        className
      )}
    >
      <div className="flex h-11 items-center justify-between border-b border-border bg-surface px-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/5" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/5" />
          <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/5" />
        </div>
        {url && (
          <div className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted">
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
