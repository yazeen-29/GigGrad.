export default function Btn({ children, variant = "primary", size = "md", onClick, disabled, icon, full }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 cursor-pointer border";
  const variants = {
    primary:   "bg-blue-700 hover:bg-blue-800 text-white border-blue-700 shadow-sm",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm",
    success:   "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm",
    danger:    "bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-sm",
    ghost:     "bg-transparent hover:bg-slate-100 text-slate-600 border-transparent",
    outline:   "bg-white hover:bg-blue-50 text-blue-700 border-blue-300 shadow-sm",
  };
  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-sm px-5 py-2.5",
    xl: "text-base px-6 py-3",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${full ? "w-full" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {icon && icon}
      {children}
    </button>
  );
}