import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  Quote,
  Sparkles,
  Sprout,
} from "lucide-react";
import Reveal from "./Reveal";
const readings = [
  {
    title: "Little Women",
    author: "Louisa May Alcott",
    theme: "A little courage",
    quote: "I’m not afraid of storms, for I’m learning how to sail my ship.",
    note: "Amy March, chapter 44",
    reflection:
      "Confidence can grow while you’re still learning. Pick a small project and give yourself room to improve.",
    url: "https://www.gutenberg.org/files/514/514-h/514-h.htm#chap44",
    style: "sailing",
  },
  {
    title: "Walden",
    author: "Henry David Thoreau",
    theme: "Put your ideas to work",
    quote: "Now put the foundations under them.",
    note: "Conclusion",
    reflection:
      "Give your next idea a practical beginning: one lesson, one draft, or one useful thing you can show someone.",
    url: "https://www.gutenberg.org/files/205/205-h/205-h.htm#chap18",
    style: "growing",
  },
];
function BookIllustration({ reading }) {
  return (
    <div className={`inspiration-book ${reading.style}`} aria-hidden="true">
      <span className="book-edition">THE CAMPUS BOOKSHELF</span>
      <strong>{reading.title}</strong>
      <svg viewBox="0 0 160 120" fill="none">
        {reading.style === "sailing" ? (
          <>
            <g className="book-boat">
              <path d="M35 83h90l-16 20H53L35 83Z" fill="currentColor" />
              <path
                d="M78 18v61H39l39-61Zm7 9 34 52H85V27Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </g>
            <path
              className="book-wave"
              d="M10 111q15-10 30 0t30 0t30 0t30 0t30 0"
              stroke="currentColor"
              strokeWidth="2"
            />
          </>
        ) : (
          <>
            <path
              d="M80 108V43M80 77C38 78 30 49 35 29c30-1 50 16 45 48ZM80 60c35-1 48-26 43-46-29 0-46 18-43 46Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle
              className="book-sun"
              cx="38"
              cy="12"
              r="8"
              fill="currentColor"
            />
            <path
              d="M45 112h70M55 118h50"
              stroke="currentColor"
              strokeWidth="2"
            />
          </>
        )}
      </svg>
      <span className="book-author">{reading.author}</span>
    </div>
  );
}
export default function HomeInspiration({ setPage }) {
  const [selected, setSelected] = useState(0);
  const reading = readings[selected];
  return (
    <>
      <section className="home-intentions" aria-label="Your next chapter">
        <div>
          <span>01</span>
          <p>
            Learn something.<small>Curiosity is a good place to start.</small>
          </p>
        </div>
        <div>
          <span>02</span>
          <p>
            Make something.<small>Small projects build real confidence.</small>
          </p>
        </div>
        <div>
          <span>03</span>
          <p>
            Become a little more you.
            <small>Let your work tell your story.</small>
          </p>
        </div>
      </section>
      <section className="home-inspiration" id="inspiration">
        <Reveal>
          <div className="inspiration-heading">
            <div>
              <span className="eyebrow">
                <Sparkles size={14} /> A LITTLE PERSPECTIVE
              </span>
              <h2>
                Big journeys.
                <br />
                <em>Small beginnings.</em>
              </h2>
            </div>
            <p>
              A few words to come back to when the next step feels bigger than
              you are.
            </p>
          </div>
        </Reveal>
        <div className="inspiration-grid">
          <Reveal className="inspiration-person-wrap">
            <figure className="inspiration-person">
              <img
                src="/images/home/katherine-johnson.jpg"
                alt="NASA mathematician Katherine Johnson at her desk"
                width="800"
                height="1000"
                loading="lazy"
              />
              <div className="person-orbit" aria-hidden="true">
                <span />
              </div>
              <figcaption>
                <span className="inspiration-kicker">FIND WHAT MOVES YOU</span>
                <Quote size={29} aria-hidden="true" />
                <blockquote>
                  “Like what you do; then you will do your best.”
                </blockquote>
                <div className="person-identity">
                  <span>
                    <strong>Katherine Johnson</strong>
                    <small>NASA research mathematician</small>
                  </span>
                  <a
                    href="https://science.nasa.gov/people/katherine-johnson/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Read Katherine Johnson’s words on NASA"
                  >
                    <ArrowUpRight size={22} />
                  </a>
                </div>
                <span className="person-photo-credit">
                  Photo: NASA · Historical inspiration
                </span>
              </figcaption>
            </figure>
          </Reveal>
          <Reveal delay={120} className="inspiration-reading-wrap">
            <div className="inspiration-reading">
              <div className="reading-heading">
                <span className="eyebrow">
                  <BookOpen size={15} /> FROM THE BOOKSHELF
                </span>
                <span>0{selected + 1} / 02</span>
              </div>
              <div className="reading-switch" aria-label="Choose a book">
                {readings.map((item, i) => (
                  <button
                    key={item.title}
                    aria-pressed={selected === i}
                    onClick={() => setSelected(i)}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
              <div key={reading.title} className="reading-page">
                <BookIllustration reading={reading} />
                <div className="reading-quote">
                  <span className="inspiration-kicker">{reading.theme}</span>
                  <blockquote>“{reading.quote}”</blockquote>
                  <p className="reading-attribution">
                    {reading.author} · <cite>{reading.title}</cite>
                    <small>{reading.note}</small>
                  </p>
                </div>
                <p className="reading-reflection">{reading.reflection}</p>
                <a
                  className="reading-source"
                  href={reading.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read the original passage <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="home-growth">
        <Reveal className="growth-photo">
          <img
            src="/images/home/learning-together.jpg"
            alt="Two students learning together with books and a laptop in a library"
            width="800"
            height="1200"
            loading="lazy"
          />
          <span className="growth-photo-note">
            <Sprout size={21} /> A little progress, every day.
          </span>
          <a
            href="https://www.pexels.com/photo/students-studying-at-the-library-6281016/"
            target="_blank"
            rel="noopener noreferrer"
            className="home-photo-credit"
          >
            Photo: Yaroslav Shuraev / Pexels
          </a>
        </Reveal>
        <Reveal className="growth-copy" delay={120}>
          <span className="eyebrow">
            <Compass size={15} /> START WHERE YOU ARE
          </span>
          <h2>
            You don’t need it
            <br />
            all figured out.
            <br />
            <em>Just a next step.</em>
          </h2>
          <p>
            Learn a skill you’re curious about. Make something with it. Let that
            become the start of a conversation, a collaboration, or your first
            campus gig.
          </p>
          <div className="growth-steps">
            {[
              [
                "01",
                "Find your direction",
                "Explore six practical learning paths.",
                "learn",
              ],
              [
                "02",
                "Build something worth showing",
                "Add projects and achievements to your profile.",
                "profile",
              ],
              [
                "03",
                "Put yourself out there",
                "Find a brief that fits your skills.",
                "jobs",
              ],
            ].map(([n, title, detail, page]) => (
              <button key={n} onClick={() => setPage(page)}>
                <span>{n}</span>
                <div>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </div>
                <ArrowUpRight size={20} />
              </button>
            ))}
          </div>
          <button onClick={() => setPage("learn")} className="growth-cta">
            Find my next skill <ArrowRight size={18} />
          </button>
        </Reveal>
      </section>
    </>
  );
}
