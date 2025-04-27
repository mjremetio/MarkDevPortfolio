import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getGalleryContent } from "@/utils/contentLoader";

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
  return (
    <motion.div 
      className="gallery-image-container rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 aspect-video"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .gallery-image {
          transition: transform 0.3s ease;
        }
        
        .gallery-image-container:hover .gallery-image {
          transform: scale(1.05);
        }
      `}} />
      
      {imagePath ? (
        <div className="w-full h-full relative gallery-image">
          <img 
            src={imagePath} 
            alt={alt || `Gallery image ${index + 1}`} 
            className="w-full h-full object-cover" 
          />
        </div>
      ) : (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center gallery-image">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">{alt}</span>
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

  useEffect(() => {
    // Set default content
    const defaultContent = getGalleryContent();
    setContent(defaultContent);
    
    // Attempt to fetch updated content from API
    fetch('/api/content/gallery')
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Failed to fetch gallery content');
      })
      .then(data => {
        setContent(data);
      })
      .catch(error => {
        console.log('Using default gallery content:', error);
        // On error, use the local content (already set as default)
      });
  }, []);

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
    <section id="gallery" className="py-16 md:py-24 bg-white dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans text-gray-900 dark:text-white">{content.title}</h2>
          <div className="mt-3 w-16 h-1 bg-gradient-to-r from-primary-600 to-secondary-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {content.description}
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.images && content.images.length > 0 ? (
            // Render actual images if available
            content.images.map((imagePath, index) => (
              <GalleryItem 
                key={index}
                imagePath={imagePath}
                alt={`Gallery image ${index + 1}`}
                index={index}
              />
            ))
          ) : (
            // Render placeholders if no images available
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
