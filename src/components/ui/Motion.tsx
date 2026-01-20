import React from 'react';
import { motion } from 'framer-motion';

interface Props {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    direction?: 'up' | 'down' | 'left' | 'right';
}

export const FadeIn: React.FC<Props> = ({ children, delay = 0, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
);

export const StaggerContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <motion.div
        initial="hidden"
        animate="show"
        variants={{
            hidden: { opacity: 0 },
            show: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.1
                }
            }
        }}
        className={className}
    >
        {children}
    </motion.div>
);

export const ScaleIn: React.FC<Props> = ({ children, delay = 0, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
);
