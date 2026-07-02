import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { smoothScrollTo } from "@/utils/smoothScroll";
import { downloadResume } from "@/utils/downloadResume";
import { getHeroContent } from "@/utils/contentLoader";
import { useContentLoading } from "@/contexts/ContentLoadingContext";
import CountUp from "@/components/CountUp";

interface HeroCTA {
  text: string;
  link: string;
  primary: boolean;
  icon: string;
  downloadAction?: boolean;
}

interface HeroStat {
  value: string;
  label: string;
  icon: string;
}

interface HeroContent {
  greeting: string;
  name: string;
  title: string;
  shortDescription: string;
  ctaButtons: HeroCTA[];
  stats: HeroStat[];
  profilePicture?: string;
}

const ICONS: Record<string, string> = {
  eye: "fa-eye",
  "file-text": "fa-file-lines",
  "paper-plane": "fa-paper-plane",
  download: "fa-download",
};

const ROLES = [
  "Full-Stack Web Developer",
  "Front-End Engineer",
  "Back-End Developer",
  "UI/UX Designer",
  "Cloud & Server Admin",
];

/** Looping type / delete effect for the hero role line. */
function useTypewriter(words: string[]) {
  const [text, setText] = useState("");
  useEffect(() => {
    let wordIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const step = () => {
      const word = words[wordIdx % words.length];
      if (!deleting) {
        charIdx++;
        setText(word.slice(0, charIdx));
        if (charIdx === word.length) {
          deleting = true;
          timer = setTimeout(step, 1600);
          return;
        }
      } else {
        charIdx--;
        setText(word.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          wordIdx++;
        }
      }
      timer = setTimeout(step, deleting ? 45 : 85);
    };

    timer = setTimeout(step, 400);
    return () => clearTimeout(timer);
  }, [words]);
  return text;
}

const HeroSection = () => {
  const [content, setContent] = useState<HeroContent>(getHeroContent() as HeroContent);
  const { beginLoading, endLoading } = useContentLoading();
  const typed = useTypewriter(ROLES);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      beginLoading();
      try {
        const res = await fetch("/api/content/hero");
        if (!res.ok) throw new Error("Failed to fetch hero content");
        const data = await res.json();
        if (isMounted) setContent(data);
      } catch (error) {
        console.log("Using default hero content:", error);
      } finally {
        endLoading();
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [beginLoading, endLoading]);

  // Subtle 3D tilt on the portrait card following the pointer.
  const handleTilt = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateY(${px * 12}deg) rotateX(${-py * 12}deg)`;
  };
  const resetTilt = () => {
    if (cardRef.current) cardRef.current.style.transform = "";
  };

  return (
    <section id="home">
      <div className="wrap">
        <div className="hero-grid">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="hero-eyebrow">
              <span className="p">~/mark-remetio</span> <span className="c">$</span> whoami
              <span className="caret" style={{ height: "1em", verticalAlign: "middle" }} />
            </div>
            <h1 className="hero-name">
              {content.greeting}
              <br />
              <span className="grad">{content.name}</span>
            </h1>
            <div className="hero-role">
              <span>{typed}</span>
              <span className="caret" />
            </div>
            <p className="hero-desc">{content.shortDescription}</p>

            <div>
              <span className="badge">
                <span className="pulse" />
                Available for Work
              </span>
            </div>

            <div className="hero-ctas">
              <a
                href="#projects"
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  smoothScrollTo("#projects");
                }}
              >
                <i className="fas fa-eye" />
                View Projects
              </a>
              {content.ctaButtons?.some((b) => b.downloadAction) ? (
                <button className="btn btn-ghost" onClick={() => downloadResume()}>
                  <i className="fas fa-file-lines" />
                  Download Resume
                </button>
              ) : (
                <a
                  href="#contact"
                  className="btn btn-ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    smoothScrollTo("#contact");
                  }}
                >
                  <i className="fas fa-paper-plane" />
                  Get in Touch
                </a>
              )}
            </div>

            {content.stats?.length > 0 && (
              <div className="stats">
                {content.stats.map((stat, i) => (
                  <div className="stat glass" key={i}>
                    <CountUp className="num" value={stat.value} />
                    <div className="lbl">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            className="portrait-zone"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="portrait">
              <div className="orbit-ring" />
              <div
                className="portrait-card"
                ref={cardRef}
                onMouseMove={handleTilt}
                onMouseLeave={resetTilt}
              >
                <img
                  src={content.profilePicture || "/images/profile.svg"}
                  alt="Mark Remetio — Full-Stack Web Developer"
                  width={640}
                  height={636}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.src.endsWith("/images/profile.svg")) {
                      img.src = "/images/profile.svg";
                    }
                  }}
                />
              </div>
              <div className="chip c1">
                <i className="fab fa-react" />
                React &amp; Vue
              </div>
              <div className="chip c2">
                <i className="fab fa-node-js" />
                Node.js
              </div>
              <div className="chip c3">
                <i className="fab fa-aws" />
                AWS Cloud
              </div>
              <div className="chip c4">
                <i className="fab fa-laravel" />
                Laravel
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="scroll-hint">
        <span>scroll</span>
        <span className="line" />
      </div>
    </section>
  );
};

export default HeroSection;
