import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@mui/material';

const RippleButton = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  ...props
}) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (event) => {
    if (disabled) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    if (onClick) {
      onClick(event);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = {
      position: 'relative',
      overflow: 'hidden',
      background: variant === 'primary'
        ? 'var(--primary-gradient)'
        : 'var(--glass-white)',
      backdropFilter: 'blur(10px)',
      border: variant === 'primary'
        ? 'none'
        : '1px solid var(--glass-border)',
      color: variant === 'primary' ? 'white' : 'var(--primary-blue)',
      borderRadius: 'var(--radius-md)',
      fontWeight: 500,
      textTransform: 'none',
      transition: 'all var(--duration-normal) var(--ease-spring)',
      boxShadow: 'var(--shadow-soft)',
      '&:hover': {
        background: variant === 'primary'
          ? 'var(--primary-dark)'
          : 'var(--primary-blue)',
        color: variant === 'primary' ? 'white' : 'white',
        transform: 'translateY(-2px)',
        boxShadow: 'var(--shadow-hover)'
      },
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: 'var(--shadow-soft)'
      }
    };

    return baseStyles;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Button
        onClick={handleClick}
        disabled={disabled}
        sx={getButtonStyles()}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.6)',
              transform: `translate(${ripple.x}px, ${ripple.y}px)`,
              pointerEvents: 'none',
              width: ripple.size,
              height: ripple.size,
              left: 0,
              top: 0
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}

        {/* Button shine effect */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          }}
          animate={{
            left: ['-100%', '100%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut"
          }}
        />

        {/* Button content */}
        <span style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </span>
      </Button>
    </motion.div>
  );
};

export default RippleButton;