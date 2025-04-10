import { motion } from "framer-motion";

interface TimelineItemProps {
  title: string;
  company: string;
  period: string;
  responsibilities: string[];
  index: number;
}

const TimelineItem = ({ title, company, period, responsibilities, index }: TimelineItemProps) => {
  return (
    <motion.div 
      className="timeline-item relative pl-10 pb-10"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <style jsx>{`
        .timeline-item:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 9px;
          top: 24px;
          height: calc(100% - 24px);
          width: 2px;
          background-color: rgb(99 102 241);
        }
      `}</style>
      
      <div className="absolute left-0 top-0 bg-primary-600 dark:bg-primary-500 w-5 h-5 rounded-full z-10 shadow-md"></div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-transform duration-300 hover:shadow-lg border-l-4 border-primary-600 dark:border-primary-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
          <div className="flex items-center mt-2 md:mt-0">
            <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full text-sm">{period}</span>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">{company}</p>
        
        <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
          {responsibilities.map((item, i) => (
            <li key={i} className="flex items-start">
              <i className="fas fa-check-circle text-primary-600 dark:text-primary-400 mt-1 mr-2"></i>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const ExperienceSection = () => {
  const experiences = [
    {
      title: "Web Designer and Developer",
      company: "Reed Elsevier Shared Philippines (LexisNexis Solutions)",
      period: "2024 - 2025",
      responsibilities: [
        "Website Development & Management using WordPress and TeamSite CRM",
        "Integrated Salesforce and various APIs for marketing automation",
        "Managed Google Ads campaigns and analyzed performance using Google Analytics",
        "Created marketing assets using Photoshop and Canva",
        "Implemented automated workflows using Zapier for various marketing operations"
      ]
    },
    {
      title: "Full Stack Web Developer",
      company: "Razza Consulting Group, Inc.",
      period: "2022 - 2024",
      responsibilities: [
        "Planned and developed software and web applications",
        "Maintained company websites and digital products including server infrastructure",
        "Developed front-end and back-end systems in Laravel, WordPress and Moodle",
        "Managed cloud infrastructure across multiple providers (AWS, GoDaddy, etc.)"
      ]
    },
    {
      title: "Web Developer Consultant",
      company: "Good Shepherd Professional Training Services",
      period: "2021 - 2022",
      responsibilities: [
        "Conducted quarterly stress tests for eLMS review programs",
        "Implemented and maintained technical requirements of web systems",
        "Managed server infrastructure, HTML markup, URL structure, and database systems",
        "Assisted IT staff to ensure access to landing page website and LMS platform"
      ]
    },
    {
      title: "Web Developer / Administrator",
      company: "Philippine Normal University",
      period: "2020 - 2022",
      responsibilities: [
        "Built and supported infrastructure for efficient content management",
        "Collaborated with PNU-LMS clients to ensure regular content updates",
        "Gathered feedback from stakeholders to improve web services",
        "Documented core processes and maintained established standards"
      ]
    },
    {
      title: "MIS / IT Specialist",
      company: "STI College - San Jose Del Monte",
      period: "2019 - 2020",
      responsibilities: [
        "Maintained performance of computers in laboratories and offices",
        "Managed network infrastructure throughout the building",
        "Provided technical support and troubleshooting",
        "Created and implemented Clearance Management System"
      ]
    }
  ];

  return (
    <section id="experience" className="py-16 md:py-24 bg-white dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans text-gray-900 dark:text-white">Work Experience</h2>
          <div className="mt-3 w-16 h-1 bg-gradient-to-r from-primary-600 to-secondary-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A journey through my professional experience and achievements
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Timeline Container */}
          <div className="relative">
            {experiences.map((exp, index) => (
              <TimelineItem 
                key={index}
                title={exp.title}
                company={exp.company}
                period={exp.period}
                responsibilities={exp.responsibilities}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
