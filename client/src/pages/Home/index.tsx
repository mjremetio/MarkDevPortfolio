import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import SkillsSection from "./SkillsSection";
import ExperienceSection from "./ExperienceSection";
import ProjectsSection from "./ProjectsSection";
import GallerySection from "./GallerySection";
import ContactSection from "./ContactSection";
import { useEffect } from "react";
import { initScrollAnimations } from "@/utils/scrollAnimations";

const Home = () => {
  useEffect(() => {
    // Initialize scroll animations when component mounts
    initScrollAnimations();
  }, []);

  return (
    <>
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <GallerySection />
      <ContactSection />
    </>
  );
};

export default Home;
