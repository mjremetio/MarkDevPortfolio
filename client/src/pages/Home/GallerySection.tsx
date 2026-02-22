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

interface GalleryItemProps {
  imagePath: string;
  alt: string;
  index: number;
}

const GalleryItem = ({ imagePath, alt, index }: GalleryItemProps) => {
  const resolvedImage = getRenderableImageSource(imagePath);

  return (
    <motion.div
      className="gallery-image-container rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 aspect-video border border-gray-100 dark:border-slate-700/50"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {resolvedImage ? (
        <div className="w-full h-full relative gallery-image">
          <img
            src={resolvedImage}
            alt={alt || `Gallery image ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center gallery-image">
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">{alt}</span>
        </div>
      )}
    </motion.div>
  );
};

const GallerySection = () => {
  const [content, setContent] = useState<GalleryContent>({
    title: "Project Gallery",
    subtitle: "Visual Showcase",
    description: "A visual showcase of UI/UX designs and development work",
    images: []
  });
  const { beginLoading, endLoading } = useContentLoading();

  useEffect(() => {
    const defaultContent = getGalleryContent();
    setContent(defaultContent);

    let isMounted = true;
    const loadGalleryContent = async () => {
      beginLoading();
      try {
        const response = await fetch("/api/content/gallery");
        if (!response.ok) {
          throw new Error("Failed to fetch gallery content");
        }
        const data = await response.json();
        if (isMounted) {
          setContent(data);
        }
      } catch (error) {
        console.log("Using default gallery content:", error);
      } finally {
        endLoading();
      }
    };

    void loadGalleryContent();

    return () => {
      isMounted = false;
    };
  }, [beginLoading, endLoading]);

  // Display placeholder items if no images are available
  const placeholderItems = [
    { alt: "Web Dashboard" },
    { alt: "E-commerce Website" },
    { alt: "Mobile App Design" },
    { alt: "Educational Platform" },
    { alt: "Analytics Dashboard" },
    { alt: "Admin Panel" }
  ];

  return (
    <section id="gallery" className="py-16 md:py-24 bg-white dark:bg-slate-900 transition-colors duration-500">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans text-gray-900 dark:text-white">{content.title}</h2>
          <div className="section-divider"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {content.description}
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {content.images && content.images.length > 0 ? (
            content.images.map((imagePath, index) => (
              <GalleryItem
                key={index}
                imagePath={imagePath}
                alt={`Gallery image ${index + 1}`}
                index={index}
              />
            ))
          ) : (
            placeholderItems.map((item, index) => (
              <GalleryItem
                key={index}
                imagePath=""
                alt={item.alt}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
