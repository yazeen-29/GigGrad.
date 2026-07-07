import { STATUS_CFG } from "../../data/constants";

export default function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG["open"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.tw}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}