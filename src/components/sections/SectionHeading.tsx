'use client';

import { motion } from 'motion/react';
import ParallaxLayer from '@/components/Depth/ParallaxLayer';

export default function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <ParallaxLayer speed={0.08}>
    <motion.div
      className="section-heading"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <h2 className="section-title">{title}</h2>
      {sub && <p className="section-sub">{sub}</p>}
    </motion.div>
    </ParallaxLayer>
  );
}
