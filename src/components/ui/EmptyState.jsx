export default function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="py-20 text-center">
      {Icon && (
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon size={24} className="text-slate-400" />
        </div>
      )}
      <p className="font-semibold text-slate-700 mb-1">{title}</p>
      {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
    </div>
  );
}
