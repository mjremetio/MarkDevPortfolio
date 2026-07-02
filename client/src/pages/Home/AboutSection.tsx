import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getAboutContent, type AboutContentData } from "@/utils/contentLoader";
import { useContentLoading } from "@/contexts/ContentLoadingContext";
import CountUp from "@/components/CountUp";

const rise = {
  hidden: { opacity: 0, y: 34 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08 },
  }),
};

const AboutSection = () => {
  const [content, setContent] = useState<AboutContentData>(getAboutContent());
  const { beginLoading, endLoading } = useContentLoading();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      beginLoading();
      try {
        const res = await fetch("/api/content/about");
        if (!res.ok) throw new Error("Failed to fetch about content");
        const data = await res.json();
        if (isMounted) setContent(data);
      } catch (error) {
        console.log("Using default about content:", error);
      } finally {
        endLoading();
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [beginLoading, endLoading]);

  return (
    <section id="about">
      <div className="wrap">
        <motion.div
          className="section-head"
          variants={rise}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="eyebrow">// about-me.md</div>
          <h2 className="h2">
            Versatile <span className="grad">Full-Stack</span> Developer &amp; Designer
          </h2>
        </motion.div>

        <div className="about-grid">
          <motion.div
            className="about-copy"
            variants={rise}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {content.description?.map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            {content.statItems && content.statItems.length > 0 && (
              <div className="mini-stats">
                {content.statItems.map((s, i) => (
                  <div key={i}>
                    <CountUp value={s.value} />
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <div className="feature-grid">
            {content.features?.map((f, i) => (
              <motion.div
                className="feature glass"
                key={i}
                custom={i}
                variants={rise}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="fi">
                  <i className={`fas fa-${f.icon}`} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
