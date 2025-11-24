import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';

const LoadingSpinner = ({
  size = 40,
  thickness = 4,
  color = 'var(--primary-blue)',
  secondaryColor = 'var(--primary-light)',
  text = '',
  fullScreen = false,
  ...props
}) => {
  const spinnerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  const containerStyles = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--glass-white)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  };

  return (
    <motion.div
      variants={spinnerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={containerStyles}
      {...props}
    >
      <Box sx={{ position: 'relative', mb: text ? 2 : 0 }}>
        {/* Outer ring */}
        <motion.svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'absolute' }}
        >
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={(size - thickness) / 2}
            stroke={secondaryColor}
            strokeWidth={thickness * 0.3}
            fill="none"
            opacity={0.2}
          />
        </motion.svg>

        {/* Main spinning ring */}
        <motion.svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={(size - thickness) / 2}
            stroke="url(#gradient)"
            strokeWidth={thickness}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${(size - thickness) * Math.PI * 0.75} ${(size - thickness) * Math.PI}`}
            animate={{
              strokeDashoffset: [(size - thickness) * Math.PI, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="50%" stopColor={secondaryColor} />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
        </motion.svg>

        {/* Inner pulsing dot */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: thickness * 0.8,
            height: thickness * 0.8,
            borderRadius: '50%',
            background: color,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Orbiting dots */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: thickness * 0.4,
              height: thickness * 0.4,
              borderRadius: '50%',
              background: secondaryColor,
              top: '50%',
              left: '50%'
            }}
            animate={{
              rotate: [0, 360],
              x: [0, Math.cos((i * 120 * Math.PI) / 180) * (size * 0.3)],
              y: [0, Math.sin((i * 120 * Math.PI) / 180) * (size * 0.3)]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "linear"
            }}
          />
        ))}
      </Box>

      {/* Loading text with typewriter effect */}
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'var(--primary-blue)',
              fontWeight: 500,
              textAlign: 'center',
              position: 'relative'
            }}
          >
            {text}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ marginLeft: '2px' }}
            >
              |
            </motion.span>
          </Typography>
        </motion.div>
      )}

    </motion.div>
  );
};

// Skeleton screen component
export const SkeletonLoader = ({ width = '100%', height = '20px', ...props }) => {
  return (
    <motion.div
      style={{
        width,
        height,
        background: 'var(--glass-white)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden'
      }}
      animate={{
        background: [
          'var(--glass-white)',
          'var(--glass-blue)',
          'var(--glass-white)'
        ]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      {...props}
    />
  );
};

export default LoadingSpinner;