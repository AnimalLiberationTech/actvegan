import logo from "../assets/logo.png";

function BrandLogo({ className = "", size = "sm" }) {
  const sizeClass = size === "lg" ? "size-20 sm:size-24" : "size-9";

  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-xl bg-[#f4f0e2] ${sizeClass} ${className}`}
    >
      <img
        src={logo}
        alt="actFTA sheep mascot"
        className="absolute left-1/2 top-[52%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
        style={{ width: size === "lg" ? "180%" : "240%" }}
      />
    </span>
  );
}

export default BrandLogo;
