import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import ServicesSection from "./ServicesSection";
import SkillsSection from "./SkillsSection";
import ProjectsSection from "./ProjectsSection";
import CredentialsSection from "./CredentialsSection";
import GallerySection from "./GallerySection";
import ProcessSection from "./ProcessSection";
import ContactSection from "./ContactSection";
import TechMarquee from "@/components/TechMarquee";

const Home = () => {
  return (
    <>
      <HeroSection />
      <TechMarquee />
      <AboutSection />
      <ServicesSection />
      <SkillsSection />
      <ProjectsSection />
      <CredentialsSection />
      <GallerySection />
      <ProcessSection />
      <ContactSection />
    </>
  );
};

export default Home;
