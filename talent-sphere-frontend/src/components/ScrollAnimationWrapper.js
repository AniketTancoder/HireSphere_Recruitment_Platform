import React from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Box } from '@mui/material';

const ScrollAnimationWrapper = ({
  children,
  animation = 'fadeInUp',
  threshold = 0.1,
  delay = 0,
  duration = 0.6,
  once = true,
  ...props
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { threshold, once });

  // Scroll-based transforms
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.1]);

  const animations = {
    fadeInUp: {
      initial: { opacity: 0, y: 50 },
      animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
    },
    fadeInDown: {
      initial: { opacity: 0, y: -50 },
      animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }
    },
    fadeInLeft: {
      initial: { opacity: 0, x: -50 },
      animate: isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }
    },
    fadeInRight: {
      initial: { opacity: 0, x: 50 },
      animate: isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.8 },
      animate: isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
    },
    slideInFromBottom: {
      initial: { y: 100, opacity: 0 },
      animate: isInView ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }
    },
    parallax: {
      style: { y, opacity }
    },
    scaleParallax: {
      style: { scale, opacity }
    }
  };

  const selectedAnimation = animations[animation];

  return (
    <Box ref={ref} {...props}>
      <motion.div
        initial={selectedAnimation.initial}
        animate={selectedAnimation.animate}
        transition={{
          duration,
          delay,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        style={selectedAnimation.style}
      >
        {children}
      </motion.div>
    </Box>
  );
};

// Staggered animation container
export const StaggerContainer = ({
  children,
  staggerDelay = 0.1,
  animation = 'fadeInUp',
  ...props
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      {...props}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Parallax background component
export const ParallaxBackground = ({
  children,
  speed = 0.5,
  ...props
}) => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -speed * 100]);

  return (
    <Box ref={ref} {...props}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </Box>
  );
};

export default ScrollAnimationWrapper;