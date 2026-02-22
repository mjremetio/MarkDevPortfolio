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
    <section id="contact" className="py-16 md:py-24 section-alt transition-colors duration-500">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans text-gray-900 dark:text-white">Get In Touch</h2>
          <div className="section-divider"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
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
            <div className="card-enhanced bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-100 dark:border-slate-700/50">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Send Me a Message</h3>

              {/* Contact Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Your Name</label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Email Address</label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Subject</label>
                  <Input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="Project Inquiry"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Message</label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Tell me about your project or inquiry..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:bg-slate-700 dark:text-white resize-none transition-colors"
                  />
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
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
            <div className="card-enhanced bg-white dark:bg-slate-800 rounded-xl p-8 h-full border border-gray-100 dark:border-slate-700/50">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Contact Information</h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl mr-4 flex-shrink-0">
                    <i className="fas fa-envelope text-indigo-600 dark:text-indigo-400"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Email</h4>
                    <a href="mailto:mj.remetio001@gmail.com" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">mj.remetio001@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl mr-4 flex-shrink-0">
                    <i className="fab fa-linkedin text-indigo-600 dark:text-indigo-400"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">LinkedIn</h4>
                    <a href="https://www.linkedin.com/in/mark-joseph-remetio-11b58a18a/" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">linkedin.com/in/mark-joseph-remetio</a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl mr-4 flex-shrink-0">
                    <i className="fas fa-globe text-indigo-600 dark:text-indigo-400"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Location</h4>
                    <p className="text-gray-500 dark:text-gray-400">Philippines</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Connect With Me</h4>
                <div className="flex space-x-4">
                  <a href="https://www.linkedin.com/in/mark-joseph-remetio-11b58a18a/" target="_blank" rel="noopener noreferrer" className="bg-[#0077B5] text-white p-3 rounded-full hover:bg-[#005885] transition-all duration-300 hover:scale-105">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="bg-gray-800 dark:bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 transition-all duration-300 hover:scale-105">
                    <i className="fab fa-github"></i>
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="bg-[#1DA1F2] text-white p-3 rounded-full hover:bg-[#0c85d0] transition-all duration-300 hover:scale-105">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="bg-[#ea4c89] text-white p-3 rounded-full hover:bg-[#d62e72] transition-all duration-300 hover:scale-105">
                    <i className="fab fa-dribbble"></i>
                  </a>
                </div>
              </div>

              <div className="mt-10">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Available For</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 rounded-full text-sm font-medium">Freelance Projects</span>
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 rounded-full text-sm font-medium">Full-time Position</span>
                  <span className="px-3 py-1.5 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 rounded-full text-sm font-medium">Consulting</span>
                  <span className="px-3 py-1.5 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 rounded-full text-sm font-medium">Remote Work</span>
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
