import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getGalleryContent } from "@/utils/contentLoader";
import { useContentLoading } from "@/contexts/ContentLoadingContext";
import { getRenderableImageSource } from "@/utils/imagePath";

interface GalleryContent {
  title: string;
  subtitle: string;
  description: string;
  images: string[];
}

const PLACEHOLDERS = [
  "Web Dashboard",
  "E-commerce Website",
  "Mobile App Design",
  "Educational Platform",
  "Analytics Dashboard",
  "Admin Panel",
];

const GalleryCard = ({ src, label, index }: { src: string | null; label: string; index: number }) => (
  <motion.div
    className="gcard"
    initial={{ opacity: 0, scale: 0.94 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
  >
    {src ? (
      <img src={src} alt={label} loading="lazy" />
    ) : (
      <div className="gph">{label}</div>
    )}
  </motion.div>
);

const GallerySection = () => {
  const [content, setContent] = useState<GalleryContent>(
    getGalleryContent() as GalleryContent
  );
  const { beginLoading, endLoading } = useContentLoading();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      beginLoading();
      try {
        const res = await fetch("/api/content/gallery");
        if (!res.ok) throw new Error("Failed to fetch gallery content");
        const data = await res.json();
        if (isMounted) setContent(data);
      } catch (error) {
        console.log("Using default gallery content:", error);
      } finally {
        endLoading();
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [beginLoading, endLoading]);

  const hasImages = content.images && content.images.length > 0;

  return (
    <section id="gallery">
      <div className="wrap">
        <motion.div
          className="section-head"
          style={{ textAlign: "center" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="eyebrow center">// gallery.snapshots</div>
          <h2 className="h2">
            Project <span className="grad">Gallery</span>
          </h2>
          <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
            {content.description}
          </p>
        </motion.div>

        <div className="gallery-grid">
          {hasImages
            ? content.images.map((img, i) => (
                <GalleryCard
                  key={i}
                  src={getRenderableImageSource(img)}
                  label={`Gallery image ${i + 1}`}
                  index={i}
                />
              ))
            : PLACEHOLDERS.map((label, i) => (
                <GalleryCard key={i} src={null} label={label} index={i} />
              ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
