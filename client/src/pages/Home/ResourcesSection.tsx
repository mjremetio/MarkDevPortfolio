import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ResourceItem {
  name: string;
  desc: string;
  url: string;
}
interface ResourceTab {
  key: string;
  label: string;
  icon: string;
  items: ResourceItem[];
}

const TABS: ResourceTab[] = [
  {
    key: "ai-ml",
    label: "Learn AI / ML",
    icon: "brain",
    items: [
      { name: "DeepLearning.AI", desc: "Courses across ML, deep learning, and generative AI.", url: "https://www.deeplearning.ai/courses/" },
      { name: "fast.ai — Practical Deep Learning", desc: "Top-down, code-first deep learning course.", url: "https://course.fast.ai/" },
      { name: "Hugging Face LLM Course", desc: "Build, fine-tune, and deploy language models.", url: "https://huggingface.co/learn/llm-course" },
      { name: "Google ML Crash Course", desc: "Fast, practical machine-learning fundamentals.", url: "https://developers.google.com/machine-learning/crash-course" },
      { name: "Hugging Face Deep RL Course", desc: "Hands-on reinforcement learning.", url: "https://huggingface.co/learn/deep-rl-course" },
      { name: "Kaggle Learn", desc: "Bite-sized, practical data-science lessons.", url: "https://www.kaggle.com/learn" },
    ],
  },
  {
    key: "ai-eng",
    label: "AI Engineering & LLMs",
    icon: "robot",
    items: [
      { name: "Anthropic Prompt Engineering", desc: "Official guidance for prompting Claude.", url: "https://platform.claude.com/docs" },
      { name: "Anthropic Cookbook", desc: "Recipes and patterns for building with Claude.", url: "https://github.com/anthropics/claude-cookbooks" },
      { name: "OpenAI Cookbook", desc: "Practical examples for building with the API.", url: "https://cookbook.openai.com/" },
      { name: "LangChain Docs", desc: "Framework for LLM apps and agents.", url: "https://docs.langchain.com/" },
      { name: "A Year of Building with LLMs", desc: "Hard-won lessons from shipping to production.", url: "https://www.oreilly.com/radar/" },
      { name: "Chip Huyen's Blog", desc: "ML systems and AI-engineering deep dives.", url: "https://huyenchip.com/blog/" },
    ],
  },
  {
    key: "fundamentals",
    label: "Developer Fundamentals",
    icon: "code",
    items: [
      { name: "The Odin Project", desc: "A complete, free full-stack curriculum.", url: "https://www.theodinproject.com/" },
      { name: "freeCodeCamp", desc: "Hands-on coding with free certifications.", url: "https://www.freecodecamp.org/" },
      { name: "Harvard CS50x", desc: "The classic introduction to computer science.", url: "https://cs50.harvard.edu/x/" },
      { name: "MDN Web Docs", desc: "The definitive web-platform reference.", url: "https://developer.mozilla.org/" },
      { name: "roadmap.sh", desc: "Guided learning paths for every role.", url: "https://roadmap.sh/" },
      { name: "System Design Primer", desc: "Learn how to design large-scale systems.", url: "https://github.com/donnemartin/system-design-primer" },
    ],
  },
  {
    key: "practice",
    label: "Practice & Prep",
    icon: "dumbbell",
    items: [
      { name: "LeetCode", desc: "Coding-interview practice problems.", url: "https://leetcode.com/" },
      { name: "NeetCode", desc: "Curated patterns and video solutions.", url: "https://neetcode.io/" },
      { name: "Exercism", desc: "Mentored practice in 70+ languages.", url: "https://exercism.org/" },
      { name: "Codewars", desc: "Kata-based skill drills.", url: "https://www.codewars.com/" },
      { name: "Frontend Mentor", desc: "Real-world front-end build challenges.", url: "https://www.frontendmentor.io/" },
    ],
  },
  {
    key: "current",
    label: "Stay Current",
    icon: "newspaper",
    items: [
      { name: "The Batch", desc: "DeepLearning.AI's weekly AI newsletter.", url: "https://www.deeplearning.ai/the-batch/" },
      { name: "Latent Space", desc: "The AI-engineering podcast & newsletter.", url: "https://www.latent.space/" },
      { name: "Simon Willison's Blog", desc: "Sharp, frequent notes on LLMs and tools.", url: "https://simonwillison.net/" },
      { name: "Lil'Log", desc: "Lilian Weng's deep technical write-ups.", url: "https://lilianweng.github.io/" },
      { name: "TLDR", desc: "A concise daily tech newsletter.", url: "https://tldr.tech/" },
      { name: "Hacker News", desc: "The pulse of the tech industry.", url: "https://news.ycombinator.com/" },
    ],
  },
  {
    key: "tools",
    label: "Tools & References",
    icon: "toolbox",
    items: [
      { name: "Hugging Face", desc: "Models, datasets, and hosted demos.", url: "https://huggingface.co/" },
      { name: "Papers with Code", desc: "State-of-the-art papers with implementations.", url: "https://paperswithcode.com/" },
      { name: "arXiv", desc: "Open-access preprints across CS and ML.", url: "https://arxiv.org/" },
      { name: "Kaggle", desc: "Datasets, notebooks, and competitions.", url: "https://www.kaggle.com/" },
      { name: "DevDocs", desc: "Fast, unified API documentation.", url: "https://devdocs.io/" },
    ],
  },
];

const ResourcesSection = () => {
  const [active, setActive] = useState(TABS[0].key);
  const current = TABS.find((t) => t.key === active) ?? TABS[0];

  return (
    <section id="resources">
      <div className="wrap">
        <motion.div
          className="section-head"
          style={{ textAlign: "center" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="eyebrow center">// resources.curated</div>
          <h2 className="h2">
            Useful <span className="grad">Resources</span>
          </h2>
          <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
            A curated set of links I actually use and recommend — for learning AI,
            building with LLMs, and leveling up as an engineer.
          </p>
        </motion.div>

        <div className="res-tabs" role="tablist" aria-label="Resource categories">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={active === t.key}
              className={`res-tab ${active === t.key ? "active" : ""}`}
              onClick={() => setActive(t.key)}
            >
              <i className={`fas fa-${t.icon}`} />
              {t.label}
              <span className="res-count">{t.items.length}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            className="res-grid"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {current.items.map((item, i) => (
              <motion.a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="res-card glass"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: i * 0.04 }}
              >
                <div className="res-card-head">
                  <h3>{item.name}</h3>
                  <i className="fas fa-arrow-up-right-from-square" />
                </div>
                <p>{item.desc}</p>
                <span className="res-host">{new URL(item.url).hostname.replace("www.", "")}</span>
              </motion.a>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ResourcesSection;
