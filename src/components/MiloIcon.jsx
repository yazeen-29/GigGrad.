export default function MiloIcon({ busy = false }) {
  return (
    <span
      className={`milo-mascot ${busy ? "is-thinking" : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" fill="none">
        <path
          className="milo-orbit"
          d="M8 32C-2 14 27-3 39 13M10 39C30 49 53 24 40 17"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M24 6L29 17L41 22L30 28L25 41L19 29L7 24L19 18Z"
          fill="currentColor"
        />
        <g
          className="milo-eyes"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M20 23v3M28 22v3" />
        </g>
        <circle cx="39" cy="8" r="3" fill="#fbbf24" />
      </svg>
    </span>
  );
}
