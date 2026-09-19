import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Section header: huge display title, a short intro, and an optional action on the right. */
export function SectionHeading({
  id,
  title,
  children,
  aside,
  className,
}: {
  id: string;
  title: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end", className)}>
      <div>
        <h2 id={id} className="display text-[clamp(3rem,8.5vw,8rem)]">
          {title}
        </h2>
        {children && <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--s-muted)] md:text-xl">{children}</p>}
      </div>
      {aside && <div className="lg:pb-3">{aside}</div>}
    </header>
  );
}
