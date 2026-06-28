import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Lock, Download, Globe, ShieldCheck, Gift } from 'lucide-react';
const reasons = [
    { icon: <Zap size={20} />, title: 'Lightning Fast', desc: 'Connect in under 2 seconds' },
    { icon: <Lock size={20} />, title: 'Secure', desc: 'Private and protected meetings' },
    { icon: <Download size={20} />, title: 'No Download', desc: 'Works right in the browser' },
    { icon: <Globe size={20} />, title: 'Cross Platform', desc: 'Any device, any OS, any browser' },
    { icon: <ShieldCheck size={20} />, title: 'Encrypted', desc: 'End-to-end encryption' },
    { icon: <Gift size={20} />, title: 'Free', desc: 'No hidden charges, completely free' },
];
const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.1, duration: 0.4 },
    }),
};
export default function WhyChoose() {
    return (
        <section className="why-section section">
            <div className="container">
                <motion.div
                    className="why-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="section-badge">Why Vakyam</div>
                    <h2 className="section-title">Why choose Vakyam?</h2>
                    <p className="section-subtitle" style={{ margin: '0 auto' }}>
                        The best meeting experience with zero hassle
                    </p>
                </motion.div>
                <div className="why-grid">
                    {reasons.map((item, i) => (
                        <motion.div
                            key={item.title}
                            className="why-card"
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={cardVariants}
                            whileHover={{ x: 4 }}
                        >
                            <div className="why-icon">{item.icon}</div>
                            <div>
                                <h4>{item.title}</h4>
                                <p>{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
