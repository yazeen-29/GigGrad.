import { useEffect, useState } from "react";
export default function CampusCanvas() {
  const [paused, setPaused] = useState(() => {
    try {
      return localStorage.getItem("gg_motion_paused") === "true";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "paused" : "playing";
    try {
      localStorage.setItem("gg_motion_paused", String(paused));
    } catch {
      /* motion still works for this session */
    }
  }, [paused]);
  return (
    <>
      <div className="campus-canvas" aria-hidden="true">
        <div className="canvas-wash wash-one" />
        <div className="canvas-wash wash-two" />
        <svg
          className="campus-scribbles"
          viewBox="0 0 1600 1100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="campus-grid"
              width="42"
              height="42"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r=".8" fill="#99a5c4" opacity=".25" />
            </pattern>
          </defs>
          <rect width="1600" height="1100" fill="url(#campus-grid)" />
          <g
            fill="none"
            stroke="#6678bb"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              className="ink-trail"
              d="M-90 370C90 130 250 450 175 600S-25 630 22 475s186-56 130 70"
            />
            <path
              className="ink-trail trail-two"
              d="M1300-50c-210 150 130 190 50 380s-290 170-180 360 350 85 480 220"
            />
            <path d="m1390 150 76 36-84 14 8-50-51 43 43 7m-1260 576 17-37 17 37 40 6-29 29 6 40-34-19-35 19 7-40-29-29z" />
            <path d="m1270 920 50-21 49 22-49 20-50-21m20 12v24q30 23 60 0v-24m19-11v36" />
            <path d="m100 160 45-9 10 61-45 9zm7 15 25-5m-23 16 26-5m-24 15 17-4" />
          </g>
        </svg>
        <span className="canvas-script script-one">a little courage,</span>
        <span className="canvas-script script-two">a new beginning.</span>
        <span className="canvas-note">ideas → opportunities</span>
        <span className="canvas-spark spark-one">✧</span>
        <span className="canvas-spark spark-two">✦</span>
      </div>
      <button
        className="motion-toggle"
        onClick={() => setPaused((value) => !value)}
        aria-pressed={paused}
        title={paused ? "Resume decorative motion" : "Pause decorative motion"}
      >
        {paused ? "Play background" : "Pause motion"}
      </button>
    </>
  );
}
