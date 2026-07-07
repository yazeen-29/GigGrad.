import { Star } from "lucide-react";

export default function RatingStars({ rating }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Star size={12} className="text-amber-400 fill-amber-400" />
      <span className="text-xs font-semibold text-slate-700">{rating.toFixed(1)}</span>
    </span>
  );
}
