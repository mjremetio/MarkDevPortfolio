import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { smoothScrollTo } from "@/utils/smoothScroll";
import { downloadResume } from "@/utils/downloadResume";
import { ChevronDown, Code, Paintbrush } from "lucide-react";
import { useEffect, useState } from "react";
import { getHeroContent } from "@/utils/contentLoader";
import { useTheme } from "@/hooks/useTheme";
import { useContentLoading } from "@/contexts/ContentLoadingContext";

// Define interfaces to match the structure from AdminDashboard.tsx
interface HeroContent {
  greeting: string;
  name: string;
  title: string;
  shortDescription: string;
  ctaButtons: Array<{
    text: string;
    link: string;
    primary: boolean;
    icon: string;
    downloadAction?: boolean;
  }>;
  stats: Array<{
    value: string;
    label: string;
    icon: string;
  }>;
  badges: Array<{
    text: string;
    bgColor: string;
    textColor: string;
    darkBgColor: string;
    darkTextColor: string;
  }>;
  profilePicture?: string;
}

const HeroSection = () => {
  const [content, setContent] = useState<HeroContent>(getHeroContent() as HeroContent);
  const { theme } = useTheme();
  const { beginLoading, endLoading } = useContentLoading();

  const accentIconWrapper =
    theme === "dark"
      ? "bg-slate-800/80 border-2 border-indigo-500/20 text-white"
      : "bg-white border-2 border-indigo-100 text-indigo-700 shadow-md";
  const accentIconBackground =
    theme === "dark" ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-600";

  useEffect(() => {
    let isMounted = true;
    const loadHeroContent = async () => {
      beginLoading();
      try {
        const response = await fetch("/api/content/hero");
        if (!response.ok) {
          throw new Error("Failed to fetch hero content");
        }
        const data = await response.json();
        if (isMounted) {
          setContent(data);
        }
      } catch (error) {
        console.log("Using default hero content:", error);
      } finally {
        endLoading();
      }
    };

    void loadHeroContent();

    return () => {
      isMounted = false;
    };
  }, [beginLoading, endLoading]);

  return (
    <section
      id="home"
      className="min-h-screen flex items-center pt-28 md:pt-32 section-primary transition-colors duration-500"
    >
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <motion.div
            className="w-full md:w-1/2 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-sans leading-tight">
              <span className="text-gray-900 dark:text-white">{content.greeting} </span>
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">{content.name}</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium text-gray-600 dark:text-gray-300">{content.title}</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
              {content.shortDescription}
            </p>

            {/* Skill badges */}
            {content.badges && content.badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {content.badges.map((badge, index) => (
                  <span
                    key={index}
                    className={`badge-primary inline-flex text-sm px-3 py-1 rounded-full font-medium ${badge.bgColor} ${badge.textColor} ${badge.darkBgColor} ${badge.darkTextColor}`}
                  >
                    {badge.text}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-2">
              {content.ctaButtons && content.ctaButtons.map((button, index) => {
                const isPrimary = button.primary;
                const className = isPrimary
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-6 py-3 font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
                  : "bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-gray-50 dark:hover:bg-slate-700 px-6 py-3 font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md flex items-center";

                if (button.downloadAction) {
                  return (
                    <Button
                      key={index}
                      variant={isPrimary ? "default" : "outline"}
                      className={className}
                      onClick={() => downloadResume()}
                    >
                      {button.text}
                    </Button>
                  );
                }

                return (
                  <Button
                    key={index}
                    variant={isPrimary ? "default" : "outline"}
                    className={className}
                    onClick={() => smoothScrollTo(button.link)}
                  >
                    {button.text}
                  </Button>
                );
              })}
            </div>

            {/* Stats counters */}
            {content.stats && content.stats.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {content.stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="card-enhanced text-center p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-gray-100 dark:border-slate-700/50 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (index * 0.1) }}
                  >
                    <div className="flex justify-center mb-2">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        {stat.icon === 'calendar' && <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                        {stat.icon === 'check-circle' && <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        {stat.icon === 'users' && <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                      </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                      {stat.value}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            className="w-full md:w-1/2 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <motion.div
                className="w-64 h-64 md:w-80 md:h-80 overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-500 p-1"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(99, 102, 241, 0.2)",
                    "0 0 40px rgba(99, 102, 241, 0.3)",
                    "0 0 20px rgba(99, 102, 241, 0.2)"
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3
                }}
              >
                <motion.div
                  className="bg-white dark:bg-slate-900 rounded-full w-full h-full flex items-center justify-center overflow-hidden border-4 border-gray-50 dark:border-slate-800 shadow-inner"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src={content.profilePicture || "/images/profile-photo.png"}
                    alt="Mark Remetio"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </motion.div>

              <motion.div
                className={`absolute -bottom-4 -right-4 p-3 rounded-full ${accentIconWrapper}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className={`${accentIconBackground} p-2 rounded-full transition-colors duration-300`}>
                  <Code className="h-5 w-5" strokeWidth={2.5} />
                </div>
              </motion.div>

              <motion.div
                className={`absolute -top-4 -left-4 p-3 rounded-full ${accentIconWrapper}`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className={`${accentIconBackground} p-2 rounded-full transition-colors duration-300`}>
                  <Paintbrush className="h-5 w-5" strokeWidth={2.5} />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 hidden md:block"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2
          }}
        >
          <a
            href="#about"
            onClick={(e) => { e.preventDefault(); smoothScrollTo('#about'); }}
            className="text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            <ChevronDown className="h-8 w-8" strokeWidth={2} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
