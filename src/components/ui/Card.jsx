export default function Card({ children, className = "", onClick, hover }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick(event);
              }
            }
          : undefined
      }
      className={`bg-white rounded-xl border border-slate-200 shadow-sm ${hover ? "hover:shadow-md hover:border-slate-300 cursor-pointer transition-all duration-200" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
