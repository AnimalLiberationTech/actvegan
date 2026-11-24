import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav.jsx";

const actionTypes = [
  {
    number: "01",
    title: "Choose a clear next step",
    text: "Turn a broad intention into one concrete action you can start today.",
  },
  {
    number: "02",
    title: "Make progress visible",
    text: "Track what moved forward so small contributions do not disappear.",
  },
  {
    number: "03",
    title: "Keep momentum kind",
    text: "Use priorities and context to focus your energy without adding pressure.",
  },
];

function Stats() {
  return (
    <main className="min-h-screen bg-[#f4f3ed] px-5 py-6 text-[#1f241f] sm:px-10 lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <PublicNav />
        <section className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-[1.05fr_.95fr]">
          <div className="max-w-2xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[.18em] text-[#65705f]">
              Stats / the bigger picture
            </p>
            <h1 className="text-5xl font-semibold leading-[.95] tracking-[-.07em] sm:text-7xl">
              Actions add up
              <span className="block text-[#899b75]">when we can see them.</span>
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-[#697066]">
              actFTA is built around a simple idea: meaningful change starts
              with practical actions. This page makes the work behind that
              idea easier to understand.
            </p>
          </div>
          <div className="rounded-3xl bg-[#1f241f] p-6 text-[#f4f3ed] shadow-2xl sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#b7f36b]">
              What we measure
            </p>
            <div className="mt-8 grid gap-7 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["Focus", "One useful action at a time"],
                ["Follow-through", "Plans that become completed work"],
                ["Learning", "Patterns that help us improve"],
              ].map(([label, value]) => (
                <div key={label} className="border-t border-white/15 pt-4">
                  <p className="text-2xl font-semibold">{label}</p>
                  <p className="mt-1 text-sm text-[#abb3a7]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="border-t border-black/10 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            {actionTypes.map((action) => (
              <article key={action.number} className="rounded-2xl bg-white/60 p-6">
                <p className="text-sm font-bold text-[#899b75]">{action.number}</p>
                <h2 className="mt-8 text-xl font-semibold">{action.title}</h2>
                <p className="mt-3 leading-relaxed text-[#697066]">{action.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <p className="max-w-xl text-sm leading-relaxed text-[#697066]">
              Public impact reporting will grow as more actions are completed
              and verified. We prefer honest, useful numbers over vanity metrics.
            </p>
            <Link
              to="/donate"
              className="rounded-full bg-[#1f241f] px-5 py-3 text-sm font-semibold text-[#f4f3ed] transition-transform hover:-translate-y-0.5"
            >
              Help make more action possible
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Stats;
