import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Menu, X } from 'lucide-react';
import '../styles/navbar.css';
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };
  const navLinks = [
    { label: 'How it Works', action: () => scrollToSection('how-it-works') },
    { label: 'Features', action: () => scrollToSection('features') },
    { label: 'FAQ', action: () => scrollToSection('faq') },
    { label: 'History', action: () => navigate('/history') },
  ];
  return (
    <>
      <motion.nav
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="navbar-inner">
          {/* Logo */}
          <a className="navbar-logo" onClick={() => navigate('/')} href="#top">
            <div className="navbar-logo-icon">
              <Video size={20} />
            </div>
            <span className="brand-font navbar-brand-text">VAKYAM</span>
          </a>
          {/* Desktop Links */}
          <div className="navbar-links">
            {navLinks.map((link) => (
              <button
                key={link.label}
                className="navbar-link"
                onClick={link.action}
              >
                {link.label}
              </button>
            ))}
          </div>
          {/* Desktop Actions */}
          <div className="navbar-actions">
            <button 
              className="navbar-btn-ghost" 
              onClick={() => {
                const id = crypto.randomUUID().split('-');
                navigate(`/${id[0].slice(0,4)}-${id[1]}`);
              }}
            >
              Guest
            </button>
            <button
              className="navbar-btn-ghost"
              onClick={() => navigate('/auth')}
            >
              Register
            </button>
            <button
              className="navbar-btn-outline"
              onClick={() => navigate('/auth')}
            >
              Login
            </button>
            <button
              className="navbar-btn-primary"
              onClick={() => navigate('/auth')}
            >
              Start Meeting
            </button>
          </div>
          {/* Mobile Toggle */}
          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>
      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="navbar-mobile-menu open">
            <motion.div
              className="navbar-mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="navbar-mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="navbar-mobile-header">
                <a className="navbar-logo" href="#top">
                  <div className="navbar-logo-icon">
                    <Video size={18} />
                  </div>
                  <span className="brand-font navbar-brand-text">VAKYAM</span>
                </a>
                <button
                  className="navbar-mobile-close"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="navbar-mobile-nav">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    className="navbar-mobile-link"
                    onClick={link.action}
                  >
                    {link.label}
                  </button>
                ))}
                <button
                  className="navbar-mobile-link"
                  onClick={() => {
                    const id = crypto.randomUUID().split('-');
                    navigate(`/${id[0].slice(0,4)}-${id[1]}`);
                  }}
                >
                  Join as Guest
                </button>
              </div>
              <div className="navbar-mobile-actions">
                <button
                  className="navbar-btn-outline"
                  onClick={() => navigate('/auth')}
                >
                  Login
                </button>
                <button
                  className="navbar-btn-primary"
                  onClick={() => navigate('/auth')}
                >
                  Start Meeting
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
