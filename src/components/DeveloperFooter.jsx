import React from 'react';
import { Mail, Phone, MapPin, FileText, ArrowUpRight } from 'lucide-react';
import './DeveloperFooter.css';

const GithubIcon = ({ size = 15, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = ({ size = 15, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const DeveloperFooter = () => {
  return (
    <footer className="dev-footer">
      <div className="dev-footer-content">
        {/* Top Kicker */}
        <span className="dev-footer-kicker">GET IN TOUCH</span>

        {/* Main Headline with Highlight */}
        <h2 className="dev-footer-headline">
          Let's build something <span className="dev-footer-highlight">amazing</span> together
        </h2>

        {/* Subtitle */}
        <p className="dev-footer-desc">
          Have a project in mind? I'm always open to discussing new opportunities, creative ideas, or just a chat about technology.
        </p>

        {/* Primary Email */}
        <div className="dev-footer-email-row">
          <a
            href="mailto:lakshya.purohit.2105@gmail.com"
            className="dev-footer-email-link"
            title="Send an email"
          >
            <Mail size={20} className="dev-footer-mail-icon" />
            <span>lakshya.purohit.2105@gmail.com</span>
          </a>
        </div>

        {/* Contact Meta Details */}
        <div className="dev-footer-meta-row">
          <a href="tel:+918302457751" className="dev-footer-meta-item">
            <Phone size={14} />
            <span>+91-8302457751</span>
          </a>
          <div className="dev-footer-meta-item">
            <MapPin size={14} />
            <span>Based in Jaipur, India</span>
          </div>
        </div>

        {/* Action Pills */}
        <div className="dev-footer-pills-row">
          <a
            href="https://github.com/Lakshya-Purohit"
            target="_blank"
            rel="noopener noreferrer"
            className="dev-footer-pill"
          >
            <GithubIcon size={15} />
            <span>GitHub</span>
            <ArrowUpRight size={13} className="dev-footer-pill-arrow" />
          </a>

          <a
            href="https://www.linkedin.com/in/lakshya-purohit"
            target="_blank"
            rel="noopener noreferrer"
            className="dev-footer-pill"
          >
            <LinkedinIcon size={15} />
            <span>LinkedIn</span>
            <ArrowUpRight size={13} className="dev-footer-pill-arrow" />
          </a>

          <a
            href="https://www.lakhsyapurohit.online"
            target="_blank"
            rel="noopener noreferrer"
            className="dev-footer-pill"
          >
            <FileText size={15} />
            <span>Resume</span>
            <ArrowUpRight size={13} className="dev-footer-pill-arrow" />
          </a>
        </div>
      </div>

      {/* Watermark Bar matching screenshot */}
      <div className="dev-footer-watermark-bar">
        <div className="dev-watermark-left">
          <span className="dev-watermark-brand">
            <strong>LP</strong><span className="dev-watermark-dot">.</span>
          </span>
          <span className="dev-watermark-copy">© 2026 Lakshya Purohit</span>
        </div>

        <div className="dev-watermark-center">
          <em>Crafted with precision & passion</em>
        </div>

        <div className="dev-watermark-right">
          <a
            href="https://github.com/Lakshya-Purohit"
            target="_blank"
            rel="noopener noreferrer"
            className="dev-watermark-link"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/lakshya-purohit"
            target="_blank"
            rel="noopener noreferrer"
            className="dev-watermark-link"
          >
            LinkedIn
          </a>
          <a
            href="mailto:lakshya.purohit.2105@gmail.com"
            className="dev-watermark-link"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
};

export default DeveloperFooter;
