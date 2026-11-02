import { initials } from "../../utils/helpers";

export default function Avatar({ name, size = "md", role }) {
  const colors = {
    teacher: "bg-blue-700 text-white",
    student: "bg-emerald-600 text-white",
    admin: "bg-violet-700 text-white",
  };
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
  };
  return (
    <div
      className={`${sizes[size]} ${colors[role?.toLowerCase()] || "bg-slate-600 text-white"} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
    >
      {initials(name)}
    </div>
  );
}
