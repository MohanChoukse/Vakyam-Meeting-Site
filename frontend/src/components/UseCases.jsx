import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Users, UserSearch, Headphones, Heart } from 'lucide-react';
const useCases = [
    { icon: <Briefcase size={22} />, title: 'Business', desc: 'Team standups, client calls, and board meetings' },
    { icon: <GraduationCap size={22} />, title: 'Education', desc: 'Virtual classrooms, tutoring, and lectures' },
    { icon: <Users size={22} />, title: 'Friends', desc: 'Stay connected with friends and groups' },
    { icon: <UserSearch size={22} />, title: 'Interviews', desc: 'Conduct remote interviews efficiently' },
    { icon: <Headphones size={22} />, title: 'Support', desc: 'Customer support and helpdesk calls' },
    { icon: <Heart size={22} />, title: 'Family', desc: 'Family gatherings and celebrations' },
];
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.4 },
    }),
};
export default function UseCases() {
    return (
        <section className="use-cases-section section">
            <div className="container">
                <motion.div
                    className="use-cases-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="section-badge">Use Cases</div>
                    <h2 className="section-title">Built for every occasion</h2>
                    <p className="section-subtitle" style={{ margin: '0 auto' }}>
                        From business meetings to family calls, Vakyam fits every need
                    </p>
                </motion.div>
                <div className="use-cases-grid">
                    {useCases.map((item, i) => (
                        <motion.div
                            key={item.title}
                            className="use-case-card"
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={cardVariants}
                            whileHover={{ y: -3 }}
                        >
                            <div className="use-case-icon">{item.icon}</div>
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
