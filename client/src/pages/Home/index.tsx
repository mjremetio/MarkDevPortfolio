import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import ServicesSection from "./ServicesSection";
import SkillsSection from "./SkillsSection";
import ProjectsSection from "./ProjectsSection";
import ExperienceSection from "./ExperienceSection";
import CredentialsSection from "./CredentialsSection";
import GitHubContributions from "./GitHubContributions";
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
      <ExperienceSection />
      <CredentialsSection />
      <GitHubContributions />
      <GallerySection />
      <ProcessSection />
      <ContactSection />
    </>
  );
};

export default Home;
