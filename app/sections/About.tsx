export default function About() {
  return (
    <section className="bg-ink py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-punch">
            Why dbdiagramr
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
            Database visualization for <span className="text-punch">everyone</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed text-white/70">
            We built dbdiagramr so developers could stop guessing and start
            seeing their databases, crystal clear, with just a connection
            string. Confusing schemas become easy, shareable diagrams.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-5xl">
          <iframe
            src="https://www.youtube.com/embed/z-YlCbOBvjQ"
            title="dbdiagramr demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="aspect-video w-full rounded-[20px] border border-white/15 bg-pine shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
