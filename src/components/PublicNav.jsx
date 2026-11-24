import { Link, NavLink, useNavigate } from "react-router-dom";
import BrandLogo from "./BrandLogo.jsx";

function PublicNav() {
  const navigate = useNavigate();

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4">
      <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
        <BrandLogo />
        <span>actFTA</span>
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <NavLink
          to="/stats"
          className={({ isActive }) =>
            `transition-colors ${isActive ? "font-bold text-[#1f241f]" : "text-[#65705f] hover:text-[#1f241f]"}`
          }
        >
          Stats
        </NavLink>
        <NavLink
          to="/donate"
          className={({ isActive }) =>
            `transition-colors ${isActive ? "font-bold text-[#1f241f]" : "text-[#65705f] hover:text-[#1f241f]"}`
          }
        >
          Donate
        </NavLink>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="hidden border-0 bg-transparent text-inherit sm:block"
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="rounded-full bg-[#1f241f] px-4 py-2 font-semibold text-[#f4f3ed] transition-transform hover:-translate-y-0.5"
        >
          Get started
        </button>
      </div>
    </nav>
  );
}

export default PublicNav;
