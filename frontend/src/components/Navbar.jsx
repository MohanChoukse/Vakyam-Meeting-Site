import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Menu, X, Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { userData, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  const isPublicPage = location.pathname === '/';

  const publicNavLinks = [
    { label: 'How it Works', action: () => scrollToSection('how-it-works') },
    { label: 'Features', action: () => scrollToSection('features') },
    { label: 'FAQ', action: () => scrollToSection('faq') },
  ];

  const authNavLinks = [
    { label: 'Dashboard', action: () => navigate('/home') },
    { label: 'History', action: () => navigate('/history') },
  ];

  const linksToShow = isAuthenticated ? authNavLinks : publicNavLinks;

  return (
    <>
      <motion.nav
        className={`navbar ${scrolled || !isPublicPage ? 'scrolled' : ''}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="navbar-inner">
          <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="navbar-logo-icon">
              <Video size={20} />
            </div>
            <span className="brand-font navbar-brand-text">VAKYAM</span>
          </div>

          <div className="navbar-links">
            {linksToShow.map((link) => (
              <button
                key={link.label}
                className={`navbar-link ${location.pathname === (link.label === 'Dashboard' ? '/home' : `/${link.label.toLowerCase()}`) ? 'active' : ''}`}
                onClick={link.action}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="navbar-actions">
            {isAuthenticated ? (
              <div className="navbar-auth-actions">
                <button className="navbar-icon-btn">
                  <Bell size={20} />
                  <span className="navbar-notification-dot"></span>
                </button>
                
                <div className="navbar-profile-wrapper" ref={dropdownRef}>
                  <button 
                    className="navbar-profile-btn"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <img src={userData?.avatar} alt={userData?.name} className="navbar-avatar" />
                    <span className="navbar-username">{userData?.name}</span>
                    <ChevronDown size={16} />
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div 
                        className="navbar-profile-dropdown"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="navbar-dropdown-header">
                          <img src={userData?.avatar} alt={userData?.name} className="navbar-avatar-large" />
                          <div>
                            <p className="navbar-dropdown-name">{userData?.name}</p>
                            <p className="navbar-dropdown-email">{userData?.email}</p>
                          </div>
                        </div>
                        <div className="navbar-dropdown-divider"></div>
                        <button className="navbar-dropdown-item" onClick={() => navigate('/profile')}>
                          <User size={16} /> Profile
                        </button>
                        <button className="navbar-dropdown-item" onClick={() => navigate('/settings')}>
                          <Settings size={16} /> Settings
                        </button>
                        <div className="navbar-dropdown-divider"></div>
                        <button className="navbar-dropdown-item text-danger" onClick={logout}>
                          <LogOut size={16} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <>
                <button 
                  className="navbar-btn-ghost" 
                  onClick={() => {
                    const id = crypto.randomUUID().split('-');
                    navigate(`/${id[0].slice(0,4)}-${id[1]}`);
                  }}
                >
                  Guest
                </button>
                <button className="navbar-btn-ghost" onClick={() => navigate('/auth')}>
                  Login
                </button>
                <button className="navbar-btn-primary" onClick={() => navigate('/auth')}>
                  Get Started
                </button>
              </>
            )}
          </div>

          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

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
                <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                  <div className="navbar-logo-icon">
                    <Video size={18} />
                  </div>
                  <span className="brand-font navbar-brand-text">VAKYAM</span>
                </div>
                <button className="navbar-mobile-close" onClick={() => setMobileOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              {isAuthenticated && (
                <div className="navbar-mobile-profile">
                   <img src={userData?.avatar} alt={userData?.name} className="navbar-avatar-large" />
                   <p className="navbar-dropdown-name">{userData?.name}</p>
                   <p className="navbar-dropdown-email">{userData?.email}</p>
                </div>
              )}

              <div className="navbar-mobile-nav">
                {linksToShow.map((link) => (
                  <button key={link.label} className="navbar-mobile-link" onClick={link.action}>
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="navbar-mobile-actions">
                {isAuthenticated ? (
                  <>
                    <button className="navbar-btn-outline" onClick={() => navigate('/profile')}>Profile</button>
                    <button className="navbar-btn-outline" onClick={() => navigate('/settings')}>Settings</button>
                    <button className="navbar-btn-outline text-danger" onClick={logout}>Logout</button>
                  </>
                ) : (
                  <>
                    <button className="navbar-btn-outline" onClick={() => navigate('/auth')}>Login</button>
                    <button className="navbar-btn-primary" onClick={() => navigate('/auth')}>Start Meeting</button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
