export default function QueuePager({ page, setPage, hasNext }) {
  return (
    <div className="flex flex-wrap gap-4 justify-between items-center my-5 text-sm text-slate-500">
      <span>
        Page {page} · up to 50 records per list. List counts reflect the current
        page.
      </span>
      <div className="flex gap-4">
        <button
          className="text-blue-700 disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          ← Previous
        </button>
        <button
          className="text-blue-700 disabled:opacity-40"
          disabled={!hasNext}
          onClick={() => setPage(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
