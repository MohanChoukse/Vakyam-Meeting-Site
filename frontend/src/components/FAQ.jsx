import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
const faqs = [
  {
    q: 'Is Vakyam free to use?',
    a: 'Yes, Vakyam is completely free. There are no hidden charges, subscriptions, or premium tiers. All features including HD video, screen sharing, and chat are available for free.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No installation is needed. Vakyam runs entirely in your browser using WebRTC technology. Just click a meeting link and you\'re in — works on Chrome, Firefox, Safari, and Edge.',
  },
  {
    q: 'How many participants can join a meeting?',
    a: 'Vakyam supports multiple participants in a single meeting. The exact number depends on your network bandwidth, but we optimize for smooth performance even with several users.',
  },
  {
    q: 'Is my meeting data secure?',
    a: 'Absolutely. All meetings use peer-to-peer WebRTC connections, meaning your video and audio data goes directly between participants without passing through our servers. We also support end-to-end encryption.',
  },
  {
    q: 'Can guests join without creating an account?',
    a: 'Yes! Guests can join any meeting by simply clicking the meeting link. No account or registration is required to participate as a guest.',
  },
  {
    q: 'Does Vakyam support screen sharing?',
    a: 'Yes, you can share your entire screen or a specific application window during meetings. This feature works on all supported desktop browsers.',
  },
];
export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);
  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  return (
    <section className="faq-section section" id="faq">
      <div className="container">
        <motion.div
          className="faq-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-badge">FAQ</div>
          <h2 className="section-title">Frequently asked questions</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Got questions? We've got answers
          </p>
        </motion.div>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className={`faq-item ${activeIndex === i ? 'active' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <button className="faq-question" onClick={() => toggle(i)}>
                {faq.q}
                <ChevronDown
                  size={18}
                  className={`faq-chevron ${activeIndex === i ? 'rotated' : ''}`}
                />
              </button>
              <AnimatePresence>
                {activeIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p className="faq-answer">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
