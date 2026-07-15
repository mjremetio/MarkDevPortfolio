import { useState } from "react";
import { motion } from "framer-motion";
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
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.email.includes("@") || !formData.email.includes(".")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/contact", formData);
      toast({
        title: "Message Sent!",
        description: "Thank you for your message. I'll get back to you soon.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: "Message Failed",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact">
      <div className="wrap">
        <motion.div
          className="section-head"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="eyebrow">$ mail --to mark</div>
          <h2 className="h2">
            Get In <span className="grad">Touch</span>
          </h2>
          <p className="sub">
            Feel free to reach out for collaboration, opportunities, or just to
            say hello!
          </p>
        </motion.div>

        <div className="contact-grid">
          <motion.div
            className="contact-info glass"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="cinfo-item">
              <div className="ci">
                <i className="fas fa-envelope" />
              </div>
              <div>
                <b>Email</b>
                <a href="mailto:mj.remetio001@gmail.com">mj.remetio001@gmail.com</a>
              </div>
            </div>
            <div className="cinfo-item">
              <div className="ci">
                <i className="fab fa-linkedin-in" />
              </div>
              <div>
                <b>LinkedIn</b>
                <a
                  href="https://www.linkedin.com/in/mark-joseph-remetio-11b58a18a/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  linkedin.com/in/mark-joseph-remetio
                </a>
              </div>
            </div>
            <div className="cinfo-item">
              <div className="ci">
                <i className="fas fa-globe-asia" />
              </div>
              <div>
                <b>Location</b>
                <span className="v">Philippines · Remote-friendly</span>
              </div>
            </div>

            <div className="avail">
              <b>// available_for</b>
              <div className="avail-chips">
                <span className="ac-g">Freelance Projects</span>
                <span className="ac-b">Full-time Position</span>
                <span className="ac-p">Consulting</span>
                <span className="ac-y">Remote Work</span>
              </div>
            </div>
          </motion.div>

          <motion.form
            className="contact-form glass"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="frow">
              <div className="fgroup">
                <label htmlFor="f-name">Your Name</label>
                <input
                  id="f-name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="fgroup">
                <label htmlFor="f-email">Email Address</label>
                <input
                  id="f-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="fgroup">
              <label htmlFor="f-subject">Subject</label>
              <input
                id="f-subject"
                name="subject"
                type="text"
                placeholder="Enter message subject"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>
            <div className="fgroup">
              <label htmlFor="f-message">Message</label>
              <textarea
                id="f-message"
                name="message"
                rows={5}
                placeholder="Enter your message here..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={isSubmitting}
            >
              <i className="fas fa-paper-plane" />
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
            <div className="form-note">
              // your message is sent securely to my inbox
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
