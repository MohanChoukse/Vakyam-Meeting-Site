import React from 'react';
import { motion } from 'framer-motion';
import { Video, Share2, UserCheck } from 'lucide-react';
const steps = [
    {
        icon: <Video size={28} />,
        className: 'step-1',
        title: 'Create Meeting',
        description: 'Start a new meeting room with a single click. Get a unique meeting link instantly.',
    },
    {
        icon: <Share2 size={28} />,
        className: 'step-2',
        title: 'Share Link',
        description: 'Share the meeting link with your participants via email, chat, or social media.',
    },
    {
        icon: <UserCheck size={28} />,
        className: 'step-3',
        title: 'Join Instantly',
        description: 'Participants join directly from their browser. No installation or signup required.',
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
export default function HowItWorks() {
    return (
        <section className="how-it-works section" id="how-it-works">
            <div className="container">
                <motion.div
                    className="how-it-works-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="section-badge">How it Works</div>
                    <h2 className="section-title">Get started in three simple steps</h2>
                    <p className="section-subtitle" style={{ margin: '0 auto' }}>
                        It only takes a minute to start your first video meeting
                    </p>
                </motion.div>
                <div className="how-it-works-grid">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.title}
                            className="how-it-works-card"
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={cardVariants}
                            whileHover={{ y: -6 }}
                        >
                            <span className="how-it-works-step-num">{i + 1}</span>
                            <div className={`how-it-works-icon ${step.className}`}>
                                {step.icon}
                            </div>
                            <h3>{step.title}</h3>
                            <p>{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
