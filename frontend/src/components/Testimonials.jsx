import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
const testimonials = [
    {
        name: 'Ananya Sharma',
        role: 'Product Manager',
        avatarClass: 'avatar-1',
        initials: 'AS',
        rating: 5,
        review: 'Vakyam has transformed how our team collaborates. Crystal clear video, zero lag, and the best part — no downloads needed. We switched from Zoom and never looked back!',
    },
    {
        name: 'Rahul Verma',
        role: 'Software Engineer',
        avatarClass: 'avatar-2',
        initials: 'RV',
        rating: 5,
        review: 'The WebRTC quality is phenomenal. I use Vakyam daily for pair programming sessions and code reviews. The screen sharing works flawlessly every single time.',
    },
    {
        name: 'Priya Patel',
        role: 'University Professor',
        avatarClass: 'avatar-3',
        initials: 'PP',
        rating: 5,
        review: 'My students love joining via the link — no app installs, no sign-ups for guests. Vakyam made virtual classrooms simple and effective. Highly recommended!',
    },
];
const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.5 },
    }),
};
export default function Testimonials() {
    return (
        <section className="testimonials-section section">
            <div className="container">
                <motion.div
                    className="testimonials-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="section-badge">Testimonials</div>
                    <h2 className="section-title">Loved by thousands</h2>
                    <p className="section-subtitle" style={{ margin: '0 auto' }}>
                        See what our users have to say about Vakyam
                    </p>
                </motion.div>
                <div className="testimonials-grid">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={t.name}
                            className="testimonial-card"
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={cardVariants}
                            whileHover={{ y: -4 }}
                        >
                            <div className="testimonial-stars">
                                {Array.from({ length: t.rating }).map((_, j) => (
                                    <Star key={j} size={16} fill="#FBBF24" strokeWidth={0} />
                                ))}
                            </div>
                            <p className="testimonial-text">"{t.review}"</p>
                            <div className="testimonial-author">
                                <div className={`testimonial-avatar ${t.avatarClass}`}>
                                    {t.initials}
                                </div>
                                <div>
                                    <div className="testimonial-name">{t.name}</div>
                                    <div className="testimonial-role">{t.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}