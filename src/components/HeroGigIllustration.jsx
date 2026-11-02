import {
  ArrowUpRight,
  Check,
  Code2,
  GraduationCap,
  Palette,
  Sparkles,
} from "lucide-react";

export default function HeroGigIllustration({ setPage }) {
  return (
    <div
      className="hero-gig-scene"
      aria-label="Illustrated campus project: turn an idea into portfolio work"
    >
      <div className="hero-gig-orbit orbit-one" aria-hidden="true" />
      <div className="hero-gig-orbit orbit-two" aria-hidden="true" />
      <span className="hero-gig-spark spark-one" aria-hidden="true">
        ✦
      </span>
      <span className="hero-gig-spark spark-two" aria-hidden="true">
        ✧
      </span>
      <div className="hero-gig-card">
        <div className="hero-gig-card-top">
          <span>
            <Palette size={23} />
          </span>
          <small>A LITTLE INSPIRATION</small>
          <span className="hero-gig-dots" aria-hidden="true">
            •••
          </span>
        </div>
        <p className="hero-gig-eyebrow">YOUR SKILLS, IN ACTION</p>
        <h2>
          That thing you’re good at?
          <br />
          <em>Someone needs it.</em>
        </h2>
        <div className="hero-gig-poster" aria-hidden="true">
          <div className="hero-poster-grid" />
          <span className="hero-poster-caption">
            CAMPUS CREATIVE BRIEF / 01
          </span>
          <span className="hero-poster-title">
            Make room
            <br />
            for your ideas<span>.</span>
          </span>
          <svg className="hero-poster-flower" viewBox="0 0 100 100" fill="none">
            <g fill="currentColor">
              <ellipse cx="50" cy="28" rx="12" ry="25" />
              <ellipse cx="50" cy="72" rx="12" ry="25" />
              <ellipse cx="28" cy="50" rx="25" ry="12" />
              <ellipse cx="72" cy="50" rx="25" ry="12" />
              <ellipse
                cx="50"
                cy="28"
                rx="12"
                ry="25"
                transform="rotate(45 50 50)"
              />
              <ellipse
                cx="50"
                cy="72"
                rx="12"
                ry="25"
                transform="rotate(45 50 50)"
              />
              <ellipse
                cx="28"
                cy="50"
                rx="25"
                ry="12"
                transform="rotate(45 50 50)"
              />
              <ellipse
                cx="72"
                cy="50"
                rx="25"
                ry="12"
                transform="rotate(45 50 50)"
              />
            </g>
            <circle cx="50" cy="50" r="12" fill="#243e67" />
          </svg>
          <span className="hero-poster-footer">
            DESIGN SOMETHING THAT MATTERS <ArrowUpRight size={17} />
          </span>
        </div>
        <div className="hero-gig-tags">
          <span>Flexible work</span>
          <span>Real experience</span>
          <span>Your next chapter</span>
        </div>
        <button className="hero-gig-start" onClick={() => setPage("learn")}>
          <span>
            <GraduationCap size={22} />
          </span>
          <span>
            <strong>Start with a little curiosity.</strong>
            <small>Find a skill. Make something yours.</small>
          </span>
          <ArrowUpRight size={19} />
        </button>
      </div>
      <div className="hero-gig-float hero-gig-code" aria-hidden="true">
        <Code2 size={21} />
        <span>Ideas → reality</span>
      </div>
      <div className="hero-gig-float hero-gig-done" aria-hidden="true">
        <span>
          <Check size={16} />
        </span>
        One step closer.
      </div>
      <div className="hero-gig-note">
        <Sparkles size={22} />
        <span>
          <strong>More than pocket money.</strong>
          <small>Build skills. Meet people. Go further.</small>
        </span>
      </div>
    </div>
  );
}
