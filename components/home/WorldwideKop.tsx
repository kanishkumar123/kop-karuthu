import { ClientGlobe } from "@/components/home/ClientGlobe";

export function WorldwideKop() {
  return (
    <section data-theme="studio" className="relative overflow-hidden py-24 md:py-32" aria-labelledby="world-title">
      <div className="mx-auto grid max-w-[1500px] items-center gap-12 px-4 md:px-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 id="world-title" className="display text-[clamp(3rem,7.5vw,7rem)]">
            The Kop has <span className="text-kop">no</span> borders
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-paper/75 md:text-xl">
            For Liverpool fans in Tamil Nadu, across India and around the world. If Liverpool&rsquo;s playing and you think in Tamil, this is your stand.
          </p>
          <p className="mt-6 text-sm text-paper/50">Drag the globe to spin it.</p>
        </div>
        <ClientGlobe />
      </div>
    </section>
  );
}
