import React from 'react';
import { motion } from 'framer-motion';
import {
    Monitor, Share2, MessageSquare, Film,
    ShieldCheck, Smartphone, Zap, Radio, Wifi,
} from 'lucide-react';
const features = [
    { icon: <Monitor size={22} />, title: 'HD Video', desc: 'Crystal clear video quality for every meeting' },
    { icon: <Share2 size={22} />, title: 'Screen Sharing', desc: 'Share your screen with a single click' },
    { icon: <MessageSquare size={22} />, title: 'Live Chat', desc: 'Real-time messaging during meetings' },
    { icon: <Film size={22} />, title: 'Recording', desc: 'Record meetings for later reference' },
    { icon: <ShieldCheck size={22} />, title: 'Authentication', desc: 'Secure login and user management' },
    { icon: <Smartphone size={22} />, title: 'Responsive', desc: 'Works on mobile, tablet, and desktop' },
    { icon: <Zap size={22} />, title: 'Low Latency', desc: 'Minimal delay for natural conversations' },
    { icon: <Radio size={22} />, title: 'WebRTC', desc: 'Peer-to-peer connections for best quality' },
    { icon: <Wifi size={22} />, title: 'Socket.IO', desc: 'Real-time signaling and chat support' },
];
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.4 },
    }),
};
export default function Features() {
    return (
        <section className="features-section section" id="features">
            <div className="container">
                <motion.div
                    className="features-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="section-badge">Features</div>
                    <h2 className="section-title">Everything you need for meetings</h2>
                    <p className="section-subtitle" style={{ margin: '0 auto' }}>
                        Powerful features built for seamless communication
                    </p>
                </motion.div>
                <div className="features-grid">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            className="feature-card"
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={cardVariants}
                            whileHover={{ y: -4 }}
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h4>{feature.title}</h4>
                            <p>{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
