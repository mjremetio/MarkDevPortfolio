import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import SkillsSection from "./SkillsSection";
import ProjectsSection from "./ProjectsSection";
import ExperienceSection from "./ExperienceSection";
import GallerySection from "./GallerySection";
import ContactSection from "./ContactSection";
import TechMarquee from "@/components/TechMarquee";

const Home = () => {
  return (
    <>
      <HeroSection />
      <TechMarquee />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ExperienceSection />
      <GallerySection />
      <ContactSection />
    </>
  );
};

export default Home;
