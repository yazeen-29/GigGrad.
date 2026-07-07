export default function Card({ children, className = "", onClick, hover }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 shadow-sm ${hover ? "hover:shadow-md hover:border-slate-300 cursor-pointer transition-all duration-200" : ""} ${className}`}
    >
      {children}
    </div>
  );
}