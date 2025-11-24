import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, LinearProgress } from '@mui/material';

const PageLoader = ({
  message = 'Loading...',
  variant = 'spinner',
  size = 'medium',
  fullScreen = false,
  ...props
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 40;
      case 'large': return 80;
      case 'medium':
      default: return 60;
    }
  };

  const spinnerVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const pulseVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [0.8, 1.1, 0.8],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const dotsVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  };

  const dotVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const renderSpinner = () => (
    <motion.div
      variants={spinnerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        width: getSize(),
        height: getSize(),
        border: '3px solid var(--glass-border)',
        borderTop: '3px solid var(--primary-blue)',
        borderRadius: '50%',
        display: 'inline-block'
      }}
      transition={{
        rotate: {
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }
      }}
    />
  );

  const renderPulse = () => (
    <motion.div
      variants={pulseVariants}
      initial="initial"
      animate="animate"
      style={{
        width: getSize(),
        height: getSize(),
        background: 'var(--primary-gradient)',
        borderRadius: '50%',
        display: 'inline-block'
      }}
    />
  );

  const renderDots = () => (
    <motion.div
      variants={dotsVariants}
      initial="initial"
      animate="animate"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            delay: index * 0.2,
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: '12px',
            height: '12px',
            background: 'var(--primary-blue)',
            borderRadius: '50%'
          }}
        />
      ))}
    </motion.div>
  );

  const renderProgress = () => (
    <Box sx={{ width: '100%', maxWidth: 300 }}>
      <LinearProgress
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: 'var(--glass-border)',
          '& .MuiLinearProgress-bar': {
            background: 'var(--primary-gradient)',
            borderRadius: 3
          }
        }}
      />
    </Box>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'pulse':
        return renderPulse();
      case 'dots':
        return renderDots();
      case 'progress':
        return renderProgress();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  const containerStyles = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--glass-white)',
    backdropFilter: 'blur(20px)',
    zIndex: 9999
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-2xl)',
    minHeight: 200
  };

  return (
    <Box sx={containerStyles} {...props}>
      {renderLoader()}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          style={{ marginTop: 'var(--space-lg)', textAlign: 'center' }}
        >
          <Typography
            variant="body1"
            sx={{
              color: 'var(--primary-blue)',
              fontWeight: 500,
              marginBottom: variant === 'progress' ? 'var(--space-md)' : 0
            }}
          >
            {message}
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default PageLoader;