'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

export const AnimatedButton = React.forwardRef(({ className, children, variant = 'primary', ...props }, ref) => {
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40",
    secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80",
    ghost: "hover:bg-accent text-accent-foreground",
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "inline-flex items-center justify-center rounded-xl h-12 px-6 font-semibold transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
});

AnimatedButton.displayName = 'AnimatedButton';
