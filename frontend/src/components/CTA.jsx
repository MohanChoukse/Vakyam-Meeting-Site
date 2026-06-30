import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

export default function CTA() {
  const navigate = useNavigate();
  const { userData } = useContext(AuthContext);

  return (
    <section className="cta-section section">
      <div className="container">
        <motion.div
          className="cta-container"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="cta-content">
            <h2>Ready to start your meeting?</h2>
            <p>
              Join thousands of users who trust Vakyam for their daily
              video meetings. It's free, fast, and secure.
            </p>
            <button
              className="btn-cta"
              onClick={() => navigate(userData?.token ? '/home' : '/auth')}
            >
              {userData?.token ? 'Go to Dashboard' : 'Start Meeting'} <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
