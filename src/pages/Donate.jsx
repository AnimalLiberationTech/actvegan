import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav.jsx";

const waysToHelp = [
  {
    title: "Give your time",
    text: "Help turn ideas into clear, useful actions by sharing your skills or feedback.",
    action: "Volunteer",
  },
  {
    title: "Share the work",
    text: "Invite someone who cares about practical progress to use actFTA with you.",
    action: "Tell a friend",
  },
  {
    title: "Fund the next step",
    text: "Support hosting, accessibility, and the thoughtful work needed to keep the project growing.",
    action: "Donate",
  },
];

function Donate() {
  return (
    <main className="min-h-screen bg-[#f4f3ed] px-5 py-6 text-[#1f241f] sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-6xl">
        <PublicNav />
        <section className="grid gap-12 py-20 lg:grid-cols-[1fr_.8fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[.18em] text-[#65705f]">
              Donate / support the work
            </p>
            <h1 className="text-5xl font-semibold leading-[.95] tracking-[-.07em] sm:text-7xl">
              Help make
              <span className="block text-[#899b75]">good action easier.</span>
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-[#697066]">
              actFTA is a small, purpose-driven project. Your support helps us
              keep the product calm, useful, and accessible to the people doing
              the work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#ways-to-help"
                className="rounded-full bg-[#1f241f] px-5 py-3 text-sm font-semibold text-[#f4f3ed] transition-transform hover:-translate-y-0.5"
              >
                See ways to help
              </a>
              <Link
                to="/stats"
                className="rounded-full border border-black/15 px-5 py-3 text-sm font-semibold transition-colors hover:bg-white/60"
              >
                See our approach
              </Link>
            </div>
          </div>
          <aside className="rounded-3xl bg-[#dce8c5] p-7 sm:p-10">
            <p className="text-4xl font-semibold leading-tight tracking-[-.05em]">
              Small, steady support gives good ideas room to grow.
            </p>
            <div className="mt-10 border-t border-[#1f241f]/15 pt-5 text-sm leading-relaxed text-[#65705f]">
              We will publish transparent updates about how contributions are
              used as the project develops.
            </div>
          </aside>
        </section>
        <section id="ways-to-help" className="border-t border-black/10 py-12">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#65705f]">
            Choose what fits
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {waysToHelp.map((way) => (
              <article key={way.title} className="flex flex-col rounded-2xl bg-white/70 p-6">
                <h2 className="text-xl font-semibold">{way.title}</h2>
                <p className="mt-3 flex-1 leading-relaxed text-[#697066]">{way.text}</p>
                <button
                  type="button"
                  className="mt-8 self-start rounded-full bg-[#1f241f] px-4 py-2.5 text-sm font-semibold text-[#f4f3ed] transition-transform hover:-translate-y-0.5"
                  onClick={() => window.alert(`${way.action} options are coming soon.`)}
                >
                  {way.action}
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Donate;
