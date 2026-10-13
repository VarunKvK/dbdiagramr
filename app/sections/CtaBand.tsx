import { GreenButton, OutlineButton } from "@/components/ui/pills";

export default function CtaBand() {
  return (
    <section className="bg-cream py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="rounded-[20px] bg-ink px-8 py-12 text-center md:py-16">
          <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
            Ready to <span className="text-punch">visualize</span> your
            database?
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <GreenButton href="/visualize">Try it free</GreenButton>
            <OutlineButton
              href="https://github.com/VarunKvK/dbdiagramr"
              external
              className="border-white/40 text-white hover:bg-white/10"
            >
              View on GitHub
            </OutlineButton>
          </div>
        </div>
      </div>
    </section>
  );
}
