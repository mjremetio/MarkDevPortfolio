import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun, ArrowLeft, ChevronDown } from "lucide-react";

type BodyBlock = string | { h: string; items: string[] };

interface Guide {
  title: string;
  summary: string;
  body: BodyBlock[];
}
interface DocCategory {
  id: string;
  label: string;
  tag: string;
  time?: string;
  blurb: string;
  guides: Guide[];
}

const CATEGORIES: DocCategory[] = [
  {
    id: "basics",
    label: "Start Here",
    tag: "The basics",
    blurb: "Get oriented and productive with Claude from zero.",
    guides: [
      {
        title: "The Basics of Claude",
        summary: "What Claude is, and how to get useful results on day one.",
        body: [
          "Claude is an AI assistant you work with in plain conversation — ask a question, paste in text or files, and it responds with writing, analysis, code, or answers. There's no syntax to learn; the whole skill is in how clearly you ask.",
          { h: "Getting started", items: [
            "Open a new chat and describe what you want in a sentence or two — the more specific, the better.",
            "Attach files (PDFs, docs, images, spreadsheets) directly and ask questions about them.",
            "Treat it as a conversation: read the reply, then refine with 'shorter', 'more formal', or 'add examples'.",
            "Start a fresh chat for a new, unrelated task so the context stays clean.",
          ] },
          "Rule of thumb: give Claude the same context you'd give a capable new teammate — the goal, the audience, and any constraints — and the output improves immediately.",
        ],
      },
      {
        title: "Prompt Better",
        summary: "Simple habits that dramatically improve your results.",
        body: [
          "Most weak results come from vague asks, not model limits. A good prompt gives Claude enough to work with.",
          { h: "The core moves", items: [
            "State the goal and the audience: 'Write X for Y so they can Z'.",
            "Give context — background, constraints, tone, and length.",
            "Show an example of the output you want whenever possible.",
            "Ask for a specific format: bullets, a table, JSON, numbered steps.",
            "Iterate: critique the draft and ask for a revision instead of starting over.",
          ] },
          "For hard reasoning, ask it to think step by step. For ambiguous tasks, tell it to ask you clarifying questions before answering.",
        ],
      },
      {
        title: "Use Projects",
        summary: "Persistent context so you stop re-explaining yourself.",
        body: [
          "A Project is a workspace that remembers. Instead of re-pasting the same background into every chat, you set it once and every conversation in the Project inherits it.",
          { h: "What to put in a Project", items: [
            "Custom instructions: who you are, your goals, your preferred tone and format.",
            "Knowledge files: reference docs, brand guidelines, past work, specs.",
            "Related chats: keep every conversation for one initiative together.",
          ] },
          "Use Projects for anything ongoing — a client, a product, your writing, a course. The payoff compounds: the more context you add, the more tailored every answer becomes.",
        ],
      },
      {
        title: "Get Certified",
        summary: "Prove your Claude skills with free training.",
        body: [
          "Anthropic publishes free courses and learning resources that teach how to use Claude well — prompting, tool use, and building with the API.",
          { h: "How to approach it", items: [
            "Work through the official material at your own pace.",
            "Practice each concept in a real chat as you learn it.",
            "Keep a personal 'prompt library' of what actually works for your tasks.",
          ] },
          "The value isn't the badge — it's building the mental model for getting consistent, high-quality output.",
        ],
      },
    ],
  },
  {
    id: "head-start",
    label: "Head Start",
    tag: "Real work",
    time: "~30 min",
    blurb: "Put Claude to work on real tasks — slides, skills, and more.",
    guides: [
      {
        title: "Interface Tour",
        summary: "Find your way around the workspace.",
        body: [
          "The interface is built around the chat, with a few power features worth knowing.",
          { h: "Worth finding", items: [
            "Attachments: drop files and images straight into the message box.",
            "Projects: switch into a workspace with saved context.",
            "Artifacts: longer outputs (documents, code, apps) open in a side panel you can edit and iterate on.",
            "Model picker & settings: choose the model and manage account/usage.",
          ] },
          "Spend five minutes clicking around — knowing where things live removes most day-to-day friction.",
        ],
      },
      {
        title: "Create Slides with AI",
        summary: "Go from outline to a presentation fast.",
        body: [
          "Claude can draft the structure, copy, and speaker notes for a deck, and produce slide content you drop into PowerPoint, Google Slides, or Keynote.",
          { h: "A reliable workflow", items: [
            "Give it the topic, audience, length, and the single takeaway you want.",
            "Ask for a slide-by-slide outline first; approve or tweak it.",
            "Then request per-slide content: a headline, 3-4 bullets, and a speaker note.",
            "Keep a consistent structure so it's easy to paste in.",
            "Ask for a strong title slide and a clear closing call-to-action.",
          ] },
          "Tip: hand it your rough notes and let it organize them — editing a draft is faster than starting from blank.",
        ],
      },
      {
        title: "Your First Skill",
        summary: "Package a repeatable task so Claude just does it.",
        body: [
          "A Skill is a reusable set of instructions (and optionally files) that teaches Claude to do a specific job your way — so you never re-explain the process.",
          { h: "Build one", items: [
            "Pick a task you do often with a consistent process (e.g. 'turn meeting notes into action items').",
            "Write the steps and rules exactly as you'd brief a teammate.",
            "Include one example input and the ideal output.",
            "Save it, reuse it, and refine the instructions whenever the output drifts.",
          ] },
          "Start with one boring, repetitive task — the first Skill you build usually pays for itself within a week.",
        ],
      },
      {
        title: "Make Claude Challenge You",
        summary: "Turn it into a sparring partner, not a yes-man.",
        body: [
          "By default an assistant tends to agree. For better thinking, explicitly ask it to push back.",
          { h: "Prompts that sharpen you", items: [
            "'Argue the strongest case against this.'",
            "'What am I missing? Where is this weakest?'",
            "'Play devil's advocate and stress-test my plan.'",
            "'Rate this honestly 1-10 and tell me why it isn't higher.'",
          ] },
          "Used well, Claude becomes a tireless critic that finds the holes before your audience does — you still own the final call.",
        ],
      },
    ],
  },
  {
    id: "go-deeper",
    label: "Go Deeper",
    tag: "The pro moves",
    time: "~45 min",
    blurb: "Level up: agentic work, teams, your voice, and building with code.",
    guides: [
      {
        title: "Agentic Cowork",
        summary: "Hand off multi-step work to a more autonomous Claude.",
        body: [
          "In its more agentic modes, Claude can take a goal and carry out multi-step work — reading, drafting, and iterating across a task rather than answering one message at a time.",
          { h: "Get value from it", items: [
            "Give it a clear objective and the context or files it needs.",
            "Let it work through the steps, then review the output.",
            "Course-correct with feedback instead of micro-managing each step.",
            "Use it for research, drafting, and repetitive multi-part tasks.",
          ] },
          "Think of it as delegating a project to a capable assistant: the clearer the brief and the definition of 'done', the better the result.",
        ],
      },
      {
        title: "Set Up Your Team",
        summary: "Roll Claude out so a whole team benefits.",
        body: [
          "Team and Enterprise plans add shared Projects, centralized billing, admin controls, and higher usage — so a team works from the same context and standards.",
          { h: "A good rollout", items: [
            "Create shared Projects per function, each with agreed instructions and knowledge.",
            "Write a short internal 'how we use Claude' guide with example prompts.",
            "Set clear norms for sensitive data and review.",
            "Share wins — people adopt fastest when they see a teammate save real time.",
          ] },
          "The multiplier isn't one power user; it's everyone having the same well-briefed assistant.",
        ],
      },
      {
        title: "Train Your Voice",
        summary: "Make Claude write like you, not like 'AI'.",
        body: [
          "Claude can match your voice if you show it what your voice is. The trick is samples, not adjectives.",
          { h: "How to do it", items: [
            "Paste 2-3 pieces of your best writing and ask Claude to describe your style.",
            "Save that style description (and the samples) in a Project.",
            "Give it a short do/don't list: words you use, words you never use, sentence rhythm.",
            "Always edit the first outputs and feed the corrections back.",
          ] },
          "Over time you build a personal style guide that turns Claude into a ghostwriter that actually sounds like you.",
        ],
      },
      {
        title: "Build with Code",
        summary: "Build real software by describing what you want.",
        body: [
          "With coding tools like Claude Code, you can build and modify software by describing the outcome — Claude writes, runs, and fixes the code while you steer.",
          { h: "Make it work", items: [
            "Describe the feature and the user, not the implementation.",
            "Work in small steps: build, run, look at the result, then ask for the next change.",
            "Ask Claude to explain what it changed and why.",
            "Let it write tests and fix its own errors — then review before shipping.",
          ] },
          "You don't need to know every language to build — but staying in the loop (reading, testing, reviewing) is what separates a working product from a demo.",
        ],
      },
    ],
  },
  {
    id: "extras",
    label: "Extras",
    tag: "Stop sounding like a robot",
    blurb: "Finishing touches — sound human, dodge limits, connect your tools.",
    guides: [
      {
        title: "Sound Less AI",
        summary: "Edit out the tells that scream 'a bot wrote this'.",
        body: [
          "AI writing has patterns readers now recognize. A quick editing pass fixes most of them.",
          { h: "Tells to cut", items: [
            "Formulaic contrasts like 'it's not just X, it's Y'.",
            "Over-hedging and filler: 'it's important to note', 'in today's world'.",
            "Uniform sentence length and tidy lists of exactly three.",
            "Grandiose wrap-up conclusions.",
          ] },
          { h: "Fixes", items: [
            "Give Claude your voice first (see 'Train your voice'), then read the draft aloud.",
            "Vary sentence length, cut adverbs, keep one concrete detail per paragraph.",
            "Tell it explicitly: 'no clichés, no filler, plain and direct.'",
          ] },
        ],
      },
      {
        title: "Avoid Usage Limits",
        summary: "Get more done before you hit the caps.",
        body: [
          "Every plan has usage limits, and long chats get slower and heavier as they grow. A little hygiene goes a long way.",
          { h: "Stretch your usage", items: [
            "Start a new chat for a new task instead of one endless thread.",
            "Put stable context in a Project instead of re-pasting it every message.",
            "Be concise — trim giant pastes down to the parts that matter.",
            "Summarize a long conversation and continue from the summary.",
            "Ask for the output length you actually need.",
          ] },
          "Shorter, well-scoped chats tend to be higher quality anyway — the limit nudges you toward better habits.",
        ],
      },
      {
        title: "Connectors",
        summary: "Connect Claude to your tools and data.",
        body: [
          "Connectors (built on the Model Context Protocol) let Claude securely reach other apps and data sources — so it acts on your real information instead of only what you paste.",
          { h: "What they unlock", items: [
            "Pull context from tools you already use: docs, drives, tickets, calendars.",
            "Take actions in connected apps where supported.",
            "Keep data access scoped and permissioned.",
          ] },
          "Start with one connector that removes a copy-paste step you do every day — that's where the time savings show up first.",
        ],
      },
      {
        title: "Claude for Spreadsheets",
        summary: "Make spreadsheets without fighting formulas.",
        body: [
          "Claude is strong with tabular data: upload a spreadsheet and it can analyze it, write formulas, clean data, and explain what's going on.",
          { h: "Practical uses", items: [
            "Describe the formula you want in words and get the exact syntax.",
            "Upload a sheet and ask for summaries, pivots, or anomalies.",
            "Clean messy data: standardize formats, split columns, flag errors.",
            "Ask it to explain an inherited spreadsheet you didn't build.",
          ] },
          "Always sanity-check numbers on important work — treat Claude as a fast analyst whose output you verify, not a black box.",
        ],
      },
    ],
  },
];

const Learn = () => {
  const { theme, toggleTheme } = useTheme();
  const [active, setActive] = useState(CATEGORIES[0].id);
  const [open, setOpen] = useState<Record<string, boolean>>({});

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

  const totalGuides = CATEGORIES.reduce((n, c) => n + c.guides.length, 0);

  const renderBlock = (block: BodyBlock, i: number) => {
    if (typeof block === "string") return <p key={i}>{block}</p>;
    return (
      <div key={i}>
        <h4>{block.h}</h4>
        <ul>
          {block.items.map((it, j) => (
            <li key={j}>{it}</li>
          ))}
        </ul>
      </div>
    );
  };

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
            My own working reference for getting genuinely good with Claude — from
            first principles to pro workflows. {totalGuides} short guides,
            organized so you can jump straight to what you need.
          </p>
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
                <div className="learn-guides">
                  {c.guides.map((g, gi) => {
                    const key = `${c.id}-${gi}`;
                    const isOpen = !!open[key];
                    return (
                      <div className={`doc-card ${isOpen ? "open" : ""}`} key={key}>
                        <button
                          className="doc-toggle"
                          aria-expanded={isOpen}
                          onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
                        >
                          <div className="doc-toggle-text">
                            <h3>{g.title}</h3>
                            <p>{g.summary}</p>
                          </div>
                          <ChevronDown className="doc-chev h-5 w-5" />
                        </button>
                        {isOpen && <div className="doc-body">{g.body.map(renderBlock)}</div>}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            <div className="learn-foot">
              Personal notes on getting the most out of Claude — written in my own
              words for quick reference.
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Learn;
