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
import ResourcesSection from "./ResourcesSection";
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
      <GitHubContributions />
      <ProjectsSection />
      <ExperienceSection />
      <CredentialsSection />
      <GallerySection />
      <ProcessSection />
      <ResourcesSection />
      <ContactSection />
    </>
  );
};

export default Home;
