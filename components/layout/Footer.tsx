import Link from "next/link";
import { nav, site, socials } from "@/content/site";
import { Magnetic } from "@/components/motion/Magnetic";
import { FillOnScroll } from "@/components/motion/FillOnScroll";

export function Footer() {
  return (
    <footer data-theme="studio" data-solid className="relative overflow-hidden pt-24 md:pt-32" aria-labelledby="footer-title">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr] md:gap-20">
          <div>
            <h2 id="footer-title" className="display text-[clamp(3rem,9vw,8.5rem)]">
              Join the <span className="text-kop">Kop</span>
            </h2>
            <p className="mt-6 max-w-md text-lg text-[var(--s-muted)]">
              New reviews land the morning after every match. Watchalongs go live while the match is on. Subscribe on YouTube and turn on notifications so you don&rsquo;t miss either.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Magnetic>
                <a
                  href={site.subscribeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 rounded-full bg-kop px-7 py-4 text-lg font-semibold text-paper transition-transform active:scale-95"
                >
                  <YouTubeGlyph />
                  Subscribe on YouTube
                </a>
              </Magnetic>
              {socials
                .filter((s) => s.label !== "YouTube")
                .map((s) => (
                  <Magnetic key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-[var(--s-line)] px-6 py-4 text-lg font-medium transition-colors hover:border-kop hover:text-kop"
                    >
                      {s.label}
                      <span className="ml-2 text-sm text-[var(--s-muted)]">{s.handle}</span>
                    </a>
                  </Magnetic>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 self-end text-[15px]">
            <div>
              <p className="mb-4 text-sm text-[var(--s-muted)]">Pages</p>
              <ul className="space-y-2">
                {nav.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="hover:text-kop">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 text-sm text-[var(--s-muted)]">Hosted by</p>
              <p>Gowtham</p>
              <p>Seshadhri</p>
              <p className="mt-6 mb-2 text-sm text-[var(--s-muted)]">On YouTube since</p>
              <p>28 February 2022</p>
            </div>
          </div>
        </div>
      </div>

      <FillOnScroll className="mt-20 select-none px-2 md:mt-28" />

      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 border-t border-[var(--s-line)] px-4 py-6 text-sm text-[var(--s-muted)] md:flex-row md:items-center md:justify-between md:px-8">
        <p className="max-w-2xl">
          {site.disclaimer} Hero photos via <a href="https://www.pexels.com" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-kop">Pexels</a>.
        </p>
        <p className="shrink-0">You&rsquo;ll Never Walk Alone</p>
      </div>
    </footer>
  );
}

function YouTubeGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden fill="currentColor">
      <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15.1V8.9l5.8 3.1-5.8 3.1Z" />
    </svg>
  );
}
