import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { getGalleryContent } from "@/utils/contentLoader";
import { useContentLoading } from "@/contexts/ContentLoadingContext";
import { getRenderableImageSource } from "@/utils/imagePath";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

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
  "Landing Page",
  "CRM System",
];

const GallerySection = () => {
  const [content, setContent] = useState<GalleryContent>(
    getGalleryContent() as GalleryContent
  );
  const { beginLoading, endLoading } = useContentLoading();
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [dims, setDims] = useState({ w: 260, h: 166, radius: 900 });

  const ringRef = useRef<HTMLDivElement>(null);
  const rot = useRef(0);
  const vel = useRef(0);
  const target = useRef<number | null>(null);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const dragDist = useRef(0);

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  const images = useMemo(() => {
    const src = content.images && content.images.length ? content.images : [];
    return src.map((s) => getRenderableImageSource(s)).filter(Boolean) as string[];
  }, [content.images]);

  const cells = images.length ? images : PLACEHOLDERS.map(() => "");
  const n = Math.max(cells.length, 1);
  const step = 360 / n;

  // Responsive panel size + cylinder radius (regular-polygon formula).
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const w = vw < 560 ? 150 : vw < 900 ? 200 : 260;
      const h = Math.round(w * 0.64);
      const radius = Math.round(w / 2 / Math.tan(Math.PI / n)) + (vw < 560 ? 22 : 48);
      setDims({ w, h, radius });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [n]);

  // Rotation loop: eased snap to a target, else momentum + gentle auto-spin.
  useEffect(() => {
    let raf = 0;
    const base = reduce ? 0 : -0.045;
    const loop = () => {
      if (target.current !== null) {
        rot.current += (target.current - rot.current) * 0.12;
        if (Math.abs(target.current - rot.current) < 0.05) {
          rot.current = target.current;
          target.current = null;
        }
      } else if (!dragging.current) {
        vel.current *= 0.94;
        if (Math.abs(vel.current) <= Math.abs(base) + 0.001) vel.current = base;
        rot.current += vel.current;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translateZ(${-dims.radius}px) rotateY(${rot.current}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [dims.radius, reduce]);

  const onDown = (e: React.PointerEvent) => {
    dragging.current = true;
    target.current = null;
    lastX.current = e.clientX;
    dragDist.current = 0;
    vel.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    dragDist.current += Math.abs(dx);
    const d = dx * 0.28;
    rot.current += d;
    vel.current = d;
  };
  const onUp = () => {
    dragging.current = false;
  };
  const nudge = (dir: number) => {
    const snapped = Math.round(rot.current / step) * step;
    target.current = snapped - dir * step;
  };
  const onCellClick = (src: string) => {
    if (dragDist.current < 8 && src) setLightbox(src);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

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

        <div
          className="g3d-stage"
          style={{ height: dims.h + 210 }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          onPointerCancel={onUp}
        >
          <div className="g3d-ring" ref={ringRef}>
            {cells.map((src, i) => (
              <div
                className="g3d-cell"
                key={i}
                style={{
                  width: dims.w,
                  height: dims.h,
                  marginLeft: -dims.w / 2,
                  marginTop: -dims.h / 2,
                  transform: `rotateY(${i * step}deg) translateZ(${dims.radius}px)`,
                }}
                onClick={() => onCellClick(src)}
              >
                {src ? (
                  <img src={src} alt={`Gallery ${i + 1}`} decoding="async" draggable={false} />
                ) : (
                  <div className="g3d-ph">{PLACEHOLDERS[i % PLACEHOLDERS.length]}</div>
                )}
                <span className="g3d-shade" />
              </div>
            ))}
          </div>

          <button className="g3d-nav prev" onClick={() => nudge(1)} aria-label="Previous">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="g3d-nav next" onClick={() => nudge(-1)} aria-label="Next">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="g3d-hint">
          drag to rotate · click to enlarge{images.length ? ` · ${images.length} shots` : ""}
        </div>
      </div>

      {lightbox && (
        <div className="g3d-lightbox" onClick={() => setLightbox(null)}>
          <button className="g3d-close" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox}
            alt="Gallery preview"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

export default GallerySection;
