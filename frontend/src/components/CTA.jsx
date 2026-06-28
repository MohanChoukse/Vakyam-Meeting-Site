import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  const navigate = useNavigate();

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
              onClick={() => navigate('/auth')}
            >
              Start Meeting <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
