import React, { useState } from 'react';
import {
  Mail, Phone, MapPin, FileText, ArrowUpRight,
  ShieldCheck, Scale, Lock, FileCode, X, Info
} from 'lucide-react';
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
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | 'license' | 'security' | null

  const modalContents = {
    privacy: {
      title: 'Privacy Policy — 100% Client-Side Guarantee',
      icon: ShieldCheck,
      content: (
        <div className="dev-legal-modal-body">
          <p>
            <strong>DevWizard V4 operates entirely on your local machine.</strong> All data transformations, JSON parsing, Base64 encodings/decodings, JWT inspects, RegEx computations, and cryptographic operations run locally inside your browser's V8/JavaScript engine.
          </p>
          <ul>
            <li><strong>Zero Server Transmission:</strong> No data, code, keys, or text snippets are transmitted to external remote servers.</li>
            <li><strong>Zero Analytics Data Leakage:</strong> We do not log payload contents, input values, or outputs.</li>
            <li><strong>Browser Storage:</strong> Preferences (e.g. selected theme, starred tools) are saved exclusively in your browser’s <code>localStorage</code>.</li>
          </ul>
        </div>
      )
    },
    terms: {
      title: 'Terms of Service & Usage Disclaimer',
      icon: Scale,
      content: (
        <div className="dev-legal-modal-body">
          <p>
            DevWizard V4 is provided as a free, open-source developer utility suite "AS IS", without warranty of any kind, express or implied.
          </p>
          <ul>
            <li><strong>No Liability:</strong> In no event shall the authors or copyright holders be liable for any claim, damages, or software failures arising from the use of these tools.</li>
            <li><strong>Safe Data Usage:</strong> Because all logic executes 100% client-side, DevWizard is safe for inspecting JWT tokens, certificates, and confidential payloads without cloud leakage.</li>
          </ul>
        </div>
      )
    },
    license: {
      title: 'MIT Open Source License',
      icon: FileCode,
      content: (
        <div className="dev-legal-modal-body">
          <p>Copyright (c) 2026 Lakshya Purohit</p>
          <p>
            Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.
          </p>
        </div>
      )
    },
    security: {
      title: 'Security & Cookie Policy',
      icon: Lock,
      content: (
        <div className="dev-legal-modal-body">
          <p>
            DevWizard V4 uses <strong>zero tracking or third-party advertising cookies</strong>. Native Web Cryptography APIs (<code>crypto.subtle</code>) are used for cryptographic hash calculations and AES ciphers.
          </p>
        </div>
      )
    }
  };

  const currentModal = activeModal ? modalContents[activeModal] : null;
  const ModalIcon = currentModal ? currentModal.icon : Info;

  return (
    <footer className="dev-footer">
      <div className="dev-footer-content">
        {/* Top Kicker */}
        <span className="dev-footer-kicker">GET IN TOUCH & LEGAL NOTICES</span>

        {/* Main Editorial Headline */}
        <h2 className="dev-footer-headline">
          Let's build something <span className="dev-footer-highlight">amazing</span> together
        </h2>

        {/* Subtitle */}
        <p className="dev-footer-desc">
          Have a project in mind or feedback on DevWizard? I'm always open to discussing new opportunities, creative ideas, or custom developer utilities.
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

        {/* Developer Action Pills */}
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
            href="https://www.linkedin.com/in/lakshya-purohit-a472a6200/"
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
            <span>Portfolio</span>
            <ArrowUpRight size={13} className="dev-footer-pill-arrow" />
          </a>
        </div>

        {/* Professional Legal Section */}
        <div className="dev-legal-section">
          <div className="dev-legal-grid">
            <button className="dev-legal-card" onClick={() => setActiveModal('privacy')}>
              <ShieldCheck size={18} className="dev-legal-card-icon text-accent" />
              <div className="dev-legal-card-text">
                <strong>Privacy Guarantee</strong>
                <span>100% Client-side execution. Zero server logging.</span>
              </div>
            </button>

            <button className="dev-legal-card" onClick={() => setActiveModal('terms')}>
              <Scale size={18} className="dev-legal-card-icon text-accent" />
              <div className="dev-legal-card-text">
                <strong>Terms of Service</strong>
                <span>Provided "as-is" for confidential developer workflows.</span>
              </div>
            </button>

            <button className="dev-legal-card" onClick={() => setActiveModal('license')}>
              <FileCode size={18} className="dev-legal-card-icon text-accent" />
              <div className="dev-legal-card-text">
                <strong>MIT License</strong>
                <span>Open-source software license & copyright details.</span>
              </div>
            </button>

            <button className="dev-legal-card" onClick={() => setActiveModal('security')}>
              <Lock size={18} className="dev-legal-card-icon text-accent" />
              <div className="dev-legal-card-text">
                <strong>Security & Cookies</strong>
                <span>Zero tracking cookies. Native Web Crypto API.</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Watermark & Copyright Bar */}
      <div className="dev-footer-watermark-bar">
        <div className="dev-watermark-left">
          <span className="dev-watermark-brand">
            <strong>LP</strong><span className="dev-watermark-dot">.</span>
          </span>
          <span className="dev-watermark-copy">© 2026 Lakshya Purohit. All rights reserved.</span>
        </div>

        <div className="dev-watermark-center">
          <em>DevWizard V4 • Minimalist Anthropic Suite</em>
        </div>

        <div className="dev-watermark-right">
          <button className="dev-watermark-link" onClick={() => setActiveModal('privacy')}>
            Privacy
          </button>
          <button className="dev-watermark-link" onClick={() => setActiveModal('terms')}>
            Terms
          </button>
          <button className="dev-watermark-link" onClick={() => setActiveModal('license')}>
            MIT License
          </button>
        </div>
      </div>

      {/* Interactive Legal Modal */}
      {currentModal && (
        <div className="dev-legal-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="dev-legal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dev-legal-modal-header">
              <div className="dev-legal-modal-title">
                <ModalIcon size={18} className="text-accent" />
                <span>{currentModal.title}</span>
              </div>
              <button
                className="dev-legal-modal-close"
                onClick={() => setActiveModal(null)}
                aria-label="Close legal notice"
              >
                <X size={18} />
              </button>
            </div>
            {currentModal.content}
            <div className="dev-legal-modal-footer">
              <button className="dw-btn dw-btn-primary dw-btn-sm" onClick={() => setActiveModal(null)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default DeveloperFooter;
