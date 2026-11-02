import { APP_CFG } from "../../data/constants";

export default function AppBadge({ status }) {
  const cfg = APP_CFG[status] || APP_CFG["PENDING"];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.tw}`}
    >
      {cfg.label}
    </span>
  );
}
