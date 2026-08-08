import { Star } from "lucide-react";

export default function RatingStars({ rating }) {
  const safeRating = Number(rating) || 0;
  return (
    <span className="inline-flex items-center gap-1">
      <Star size={12} className="text-amber-400 fill-amber-400" />
      <span className="text-xs font-semibold text-slate-700">{safeRating.toFixed(1)}</span>
    </span>
  );
}