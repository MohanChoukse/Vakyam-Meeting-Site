import React from 'react';
import { Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="brand-font footer-watermark">VAKYAM</div>
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <a className="navbar-logo" href="#top" onClick={() => navigate('/')}>
              <div className="navbar-logo-icon">
                <Video size={18} />
              </div>
              <span>Vakyam</span>
            </a>
            <p>
              Free, secure, and instant video meetings for everyone. No
              downloads, no installations — just connect and collaborate.
            </p>
            <div className="footer-socials">
              <a
                className="footer-social-link"
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <GitHubIcon fontSize="small" />
              </a>
              <a
                className="footer-social-link"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <TwitterIcon fontSize="small" />
              </a>
              <a
                className="footer-social-link"
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <LinkedInIcon fontSize="small" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#faq">FAQ</a>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#top">About</a>
            <a href="#top">Blog</a>
            <a href="#top">Careers</a>
          </div>

          {/* Legal */}
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#top">Privacy Policy</a>
            <a href="#top">Terms of Service</a>
            <a href="#top">Contact</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Vakyam. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#top">Privacy</a>
            <a href="#top">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
