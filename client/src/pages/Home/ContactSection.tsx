import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactSection = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiRequest('POST', '/api/contact', formData);
      
      toast({
        title: "Message Sent!",
        description: "Thank you for your message. I'll get back to you soon.",
      });
      
      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Message Failed",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans text-gray-900 dark:text-white">Get In Touch</h2>
          <div className="mt-3 w-16 h-1 bg-gradient-to-r from-primary-600 to-secondary-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have a project in mind or want to discuss a potential collaboration? Reach out to me through any of these channels.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10">
          <motion.div 
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Send Me a Message</h3>
              
              {/* Contact Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
                    <Input 
                      type="text" 
                      id="name" 
                      name="name" 
                      placeholder="John Doe" 
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <Input 
                      type="email" 
                      id="email" 
                      name="email" 
                      placeholder="john@example.com" 
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                  <Input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    placeholder="Project Inquiry" 
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    rows={5} 
                    placeholder="Tell me about your project or inquiry..." 
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>
                
                <div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <i className="fas fa-paper-plane ml-2"></i>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
          
          <motion.div 
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 h-full">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mr-4">
                    <i className="fas fa-envelope text-primary-600 dark:text-primary-400"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Email</h4>
                    <a href="mailto:mj.remetio001@gmail.com" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">mj.remetio001@gmail.com</a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mr-4">
                    <i className="fas fa-phone text-primary-600 dark:text-primary-400"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Phone</h4>
                    <a href="tel:+639368601808" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">+639368601808</a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mr-4">
                    <i className="fab fa-linkedin text-primary-600 dark:text-primary-400"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">LinkedIn</h4>
                    <a href="https://www.linkedin.com/in/mark-joseph-remetio-11b58a18a/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">linkedin.com/in/mark-joseph-remetio</a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mr-4">
                    <i className="fas fa-globe text-primary-600 dark:text-primary-400"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Location</h4>
                    <p className="text-gray-600 dark:text-gray-300">Philippines</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Connect With Me</h4>
                <div className="flex space-x-4">
                  <a href="https://www.linkedin.com/in/mark-joseph-remetio-11b58a18a/" target="_blank" rel="noopener noreferrer" className="bg-[#0077B5] text-white p-3 rounded-full hover:bg-[#005885] transition-colors duration-300">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="bg-[#333] text-white p-3 rounded-full hover:bg-[#222] transition-colors duration-300">
                    <i className="fab fa-github"></i>
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="bg-[#1DA1F2] text-white p-3 rounded-full hover:bg-[#0c85d0] transition-colors duration-300">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="bg-[#ea4c89] text-white p-3 rounded-full hover:bg-[#d62e72] transition-colors duration-300">
                    <i className="fab fa-dribbble"></i>
                  </a>
                </div>
              </div>
              
              <div className="mt-10">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Available For</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm">Freelance Projects</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm">Full-time Position</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm">Consulting</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-sm">Remote Work</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
