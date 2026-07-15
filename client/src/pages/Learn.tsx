import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun, ArrowUpRight, ArrowLeft } from "lucide-react";

interface DocLink {
  title: string;
  desc: string;
  url: string;
}
interface DocCategory {
  id: string;
  label: string;
  tag: string;
  time?: string;
  blurb: string;
  links: DocLink[];
}

const CATEGORIES: DocCategory[] = [
  {
    id: "basics",
    label: "Start Here",
    tag: "The basics",
    blurb: "Get oriented and productive with Claude from zero.",
    links: [
      { title: "The basics of Claude", desc: "A plain-English intro to what Claude is and how to actually start using it well.", url: "https://ruben.substack.com/p/claude-for-dummies" },
      { title: "Prompt better", desc: "Practical prompting techniques to get sharper, more useful answers.", url: "https://ruben.substack.com/p/prompt-47" },
      { title: "Use Projects", desc: "Organize your work with Claude Projects so context persists across chats.", url: "https://ruben.substack.com/p/claude-cowork-project" },
      { title: "Get free certified", desc: "How to earn a free Claude certification and prove your skills.", url: "https://ruben.substack.com/p/im-claude-certified" },
    ],
  },
  {
    id: "head-start",
    label: "Head Start",
    tag: "Real work",
    time: "~30 min",
    blurb: "Put Claude to work on real tasks — slides, skills, and more.",
    links: [
      { title: "New interface tour", desc: "A walkthrough of Claude's redesigned interface and what's new.", url: "https://ruben.substack.com/p/claude-design" },
      { title: "Create slides with AI", desc: "Generate polished, presentation-ready slide decks with Claude.", url: "https://ruben.substack.com/p/powerpoint" },
      { title: "Your first Claude skill", desc: "Build your first reusable Skill to automate a repetitive task.", url: "https://ruben.substack.com/p/i-replaced-myself" },
      { title: "Make Claude challenge you", desc: "Turn Claude into a sparring partner instead of a yes-man.", url: "https://ruben.substack.com/p/how-to-rot-your-brain-with-ai" },
    ],
  },
  {
    id: "go-deeper",
    label: "Go Deeper",
    tag: "The pro moves",
    time: "~45 min",
    blurb: "Level up: Cowork, teams, your writing voice, and building with code.",
    links: [
      { title: "Claude Cowork", desc: "Learn 80% of Claude Cowork in about 20 minutes.", url: "https://ruben.substack.com/p/learn-80-of-claude-cowork-in-20-minutes" },
      { title: "Set up your team", desc: "Roll Claude out across your team with the right setup.", url: "https://ruben.substack.com/p/claude-for-teams" },
      { title: "Train your voice", desc: "Teach Claude to write in your voice — you're just a text file.", url: "https://ruben.substack.com/p/youre-just-a-text-file" },
      { title: "Build with code (vibecode)", desc: "The Claude Code bible — build real software by describing it.", url: "https://ruben.substack.com/p/the-claude-code-bible" },
    ],
  },
  {
    id: "extras",
    label: "Extras",
    tag: "Stop sounding like a robot",
    blurb: "The finishing touches — sound human, dodge limits, connect tools.",
    links: [
      { title: "Sound less AI", desc: "Kill the tell-tale 'it's not X, it's Y' patterns and write more human.", url: "https://ruben.substack.com/p/its-not-x-its-y" },
      { title: "Avoid token limits", desc: "How to stop hitting Claude's usage limits mid-task.", url: "https://ruben.substack.com/p/how-to-stop-hitting-claude-usage" },
      { title: "Claude connectors", desc: "Connect Claude to your tools and data with connectors.", url: "https://ruben.substack.com/p/claude-connectors" },
      { title: "Use Claude for Excel", desc: "Make perfect spreadsheets with Claude, step by step.", url: "https://ruben.substack.com/p/how-to-make-perfect-spreadsheets" },
    ],
  },
];

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
};

const Learn = () => {
  const { theme, toggleTheme } = useTheme();
  const [active, setActive] = useState(CATEGORIES[0].id);

  useEffect(() => {
    const onScroll = () => {
      const pos = window.scrollY + 160;
      let current = CATEGORIES[0].id;
      for (const c of CATEGORIES) {
        const el = document.getElementById(c.id);
        if (el && pos >= el.offsetTop) current = c.id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 110, behavior: "smooth" });
  };

  const totalLinks = CATEGORIES.reduce((n, c) => n + c.links.length, 0);

  return (
    <div className="learn-page">
      <header className="learn-topbar">
        <Link href="/" className="learn-brand">
          <span className="b">&lt;</span>MarkRemetio<span className="b">/&gt;</span>
        </Link>
        <div className="learn-topbar-actions">
          <button className="nav-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? <Moon className="h-[17px] w-[17px]" /> : <Sun className="h-[17px] w-[17px]" />}
          </button>
          <Link href="/" className="learn-back">
            <ArrowLeft className="h-4 w-4" /> Back to portfolio
          </Link>
        </div>
      </header>

      <div className="learn-wrap">
        <div className="learn-hero">
          <div className="eyebrow">// docs / learn-claude.md</div>
          <h1>
            The <span className="grad">Claude</span> Playbook
          </h1>
          <p>
            A curated learning path for getting genuinely good with Claude — from
            first principles to pro workflows. {totalLinks} hand-picked guides,
            organized so you can start anywhere.
          </p>
          <div className="learn-credit">
            Curated from{" "}
            <a href="https://ruben.substack.com/" target="_blank" rel="noopener noreferrer">
              Ruben Hassid's Substack
            </a>
            .
          </div>
        </div>

        <div className="learn-layout">
          <aside className="learn-side">
            <nav aria-label="Sections">
              {CATEGORIES.map((c, i) => (
                <button
                  key={c.id}
                  className={`learn-side-link ${active === c.id ? "active" : ""}`}
                  onClick={() => jump(c.id)}
                >
                  <span className="ls-no">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    {c.label}
                    <em>{c.tag}</em>
                  </span>
                  {c.time && <span className="ls-time">{c.time}</span>}
                </button>
              ))}
            </nav>
          </aside>

          <main className="learn-content">
            {CATEGORIES.map((c, i) => (
              <section className="learn-cat" id={c.id} key={c.id}>
                <div className="learn-cat-head">
                  <div className="learn-cat-no">{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <h2>
                      {c.label} <span className="learn-cat-tag">· {c.tag}</span>
                    </h2>
                    <p>{c.blurb}</p>
                  </div>
                  {c.time && <span className="learn-time-badge">{c.time}</span>}
                </div>
                <div className="learn-links">
                  {c.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="doc-card"
                    >
                      <div className="doc-card-head">
                        <h3>{l.title}</h3>
                        <ArrowUpRight className="doc-arrow h-[18px] w-[18px]" />
                      </div>
                      <p>{l.desc}</p>
                      <span className="doc-host">{hostOf(l.url)}</span>
                    </a>
                  ))}
                </div>
              </section>
            ))}

            <div className="learn-foot">
              Links point to external articles on Substack. Credit to the original
              author,{" "}
              <a href="https://ruben.substack.com/" target="_blank" rel="noopener noreferrer">
                Ruben Hassid
              </a>
              .
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Learn;
