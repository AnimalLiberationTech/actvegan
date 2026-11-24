import { NavLink } from "react-router-dom";
import BrandLogo from "./BrandLogo.jsx";

function Navbar({ onLogout, username, darkMode, setDarkMode, isAdmin }) {
  return (
    <nav className="app-nav">
      <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-4">
        <div className="app-logo">
          <BrandLogo />
          <span>Task Manager</span>
        </div>
        <div className="flex flex-1 basis-full items-start justify-between gap-2 sm:flex-initial sm:items-center sm:gap-3.5">
          <NavLink
  to={isAdmin ? "/admin" : "/dashboard"}
  className="nav-link"
          >
  Dashboard
          </NavLink>
          <div className="nav-user" title={username}>👤 {username}</div>
          <button
  onClick={() => setDarkMode(!darkMode)}
  className="nav-button"
  aria-label={`Switch to ${darkMode ? "light" : "dark"} theme`}
          >{darkMode ? "☀️ Light" : "🌙 Dark"}</button>
          <button
  onClick={onLogout}
  className="nav-button nav-logout"
          >Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;