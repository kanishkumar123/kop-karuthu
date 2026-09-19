import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { TextReveal } from "@/components/motion/TextReveal";
import { Timeline } from "@/components/about/Timeline";
import { TornPhoto } from "@/components/brand/TornPhoto";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formats, hosts, site } from "@/content/site";
import { hostGowtham, hostSeshadhri } from "@/lib/images";

export const metadata: Metadata = {
  title: "About",
  description: "Kop Karuthu is an independent Tamil Liverpool FC fan podcast hosted by Gowtham & Seshadhri, on YouTube since February 2022.",
};

const photos = { gowtham: hostGowtham, seshadhri: hostSeshadhri };

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title={<>Who <span className="text-kop">we</span> are</>}
        intro="An independent Liverpool FC fan podcast in Tamil, hosted by Gowtham and Seshadhri."
      />

      <section data-theme="fanzine" aria-label="Manifesto">
        <TextReveal text="Kop Karuthu is two Liverpool fans talking about Liverpool, in *Tamil.* We're not the club and we're not a newsroom. We're *fans,* and every episode is our *opinion:* previews, reviews, tactics, transfers and live watchalongs, in Tamil with plenty of English football talk mixed in." />
      </section>

      {/* Hosts */}
      <section data-theme="studio" className="relative py-24 md:py-36" aria-labelledby="hosts-h">
        <div className="mx-auto max-w-[1500px] px-4 md:px-8">
          <SectionHeading id="hosts-h" title={<>The <span className="text-kop">hosts</span></>} className="mb-16" />
          <div className="grid gap-20 md:grid-cols-2 md:gap-12">
            {hosts.map((h, i) => (
              <article key={h.key} className={i === 1 ? "md:mt-32" : ""}>
                <TornPhoto img={photos[h.key]} seed={i ? 41 : 19} className="aspect-[4/5] w-full max-w-[520px]" sizes="(min-width:768px) 45vw, 100vw" />
                <p className="text-sm text-paper/60 mt-8">{h.role}</p>
                <h3 className="display mt-1 text-[clamp(3rem,6vw,5.5rem)]">{h.name}</h3>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-paper/75">{h.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section data-theme="fanzine" className="relative py-24 md:py-36" aria-labelledby="story-h">
        <div className="mx-auto max-w-[1500px] px-4 md:px-8">
          <SectionHeading id="story-h" title={<>The <span className="text-kop">story</span> so far</>} className="mb-20" />
          <Timeline />
        </div>
      </section>

      {/* What we are / aren't */}
      <section data-theme="studio" className="relative py-24 md:py-36" aria-labelledby="are-h">
        <div className="mx-auto max-w-[1500px] px-4 md:px-8">
          <h2 id="are-h" className="sr-only">What Kop Karuthu is and isn&rsquo;t</h2>
          <div className="grid gap-px overflow-hidden rounded-[20px] bg-paper/10 md:grid-cols-2">
            <div className="bg-night p-8 md:p-12">
              <p className="display text-[clamp(2.4rem,4.5vw,4rem)] text-kop">We are</p>
              <ul className="mt-8 space-y-4 text-xl">
                <li>Liverpool fans, first and last</li>
                <li>A podcast and YouTube channel in Tamil</li>
                <li>Live on YouTube for watchalongs</li>
                <li>Full of opinions, which is what karuthu means</li>
              </ul>
            </div>
            <div className="bg-night p-8 md:p-12">
              <p className="display outline-text text-[clamp(2.4rem,4.5vw,4rem)]">We&rsquo;re not</p>
              <ul className="mt-8 space-y-4 text-xl text-paper/70">
                <li>Liverpool FC, or connected to the club</li>
                <li>A news agency or accredited journalists</li>
                <li>A place to watch match footage</li>
                <li>Going to agree with you every time</li>
              </ul>
            </div>
          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-3">
            {formats.map((f) => (
              <div key={f.key} className="border-t border-paper/15 pt-5">
                <h3 className="text-2xl font-extrabold">{f.title}</h3>
                <p className="mt-2 text-paper/65">{f.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-16 max-w-2xl text-sm text-paper/50">{site.disclaimer}</p>
        </div>
      </section>
    </>
  );
}
