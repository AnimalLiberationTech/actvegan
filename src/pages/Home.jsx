import { useNavigate } from "react-router-dom";
import Noise from "../components/Noise.jsx";
import SlideCommit from "../components/SlideCommit.jsx";
import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo.jsx";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  return (
    <main className="home-page">
      <Noise
        patternSize={250}
        patternScaleX={1}
        patternScaleY={1}
        patternRefreshInterval={2}
        patternAlpha={18}
      />
      <nav className="home-nav">
        <div className="home-brand">
          <BrandLogo />
          <span>act vegan</span>
        </div>
        <div className="home-nav-actions">
          <Link
            to="/stats"
            className="hidden text-sm text-[#65705f] transition-colors hover:text-[#1f241f] sm:block"
          >
            Stats
          </Link>
          <Link
            to="/donate"
            className="hidden text-sm text-[#65705f] transition-colors hover:text-[#1f241f] sm:block"
          >
            Donate
          </Link>
          <button type="button" onClick={() => navigate("/login")}>
            Log in
          </button>
          <button
            type="button"
            className="home-nav-cta"
            onClick={() => navigate("/register")}
          >
            Get started
          </button>
        </div>
      </nav>

      <section className="home-hero">
        <div className="home-hero-copy">
          <h1> to a <span className="color-muted">kinder</span> world
            in <span className="color-muted">small</span> steps
          </h1>
          <p className="home-description">
            We are a diverse collective of vegans teaming up to act towards the goals that matter to us.
          </p>
          <div className="home-action">
            <SlideCommit
              label={isAuthenticated ? "Slide to open dashboard" : "Slide to get started"}
              doneLabel="Let&apos;s go"
              errorLabel="please log in"
              onConfirm={() =>
                new Promise((resolve) => {
                  setTimeout(resolve, 350);
                })
              }
              onDone={() =>
                navigate(isAuthenticated ? "/dashboard" : "/register")
              }
              width={390}
              height={58}
              trackColor="#1f241f"
              handleColor="#f5f4ef"
              successColor="#b7f36b"
            />
          </div>
        </div>

        <div className="home-hero-art" aria-hidden="true">
          <div className="home-orb home-orb-large" />
          <div className="home-orb home-orb-small" />
          <div className="home-note home-note-top">focus / 01</div>
          <div className="home-note home-note-bottom">one thing at a time</div>
          <div className="home-art-card">
            <BrandLogo size="lg" className="absolute -top-24 right-5 rotate-[12deg] opacity-95" />
            <span className="home-art-check">✓</span>
            <span>
              <strong>Today</strong>
              <small>3 meaningful actions</small>
            </span>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <span></span>
        <span>© {new Date().getFullYear()} Vegetarian Union of Moldova</span>
      </footer>
    </main>
  );
}

export default Home;
