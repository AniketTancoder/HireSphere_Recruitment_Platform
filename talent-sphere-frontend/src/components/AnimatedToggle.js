import React from 'react';
import { motion } from 'framer-motion';
import { Switch, FormControlLabel, Box } from '@mui/material';

const AnimatedToggle = ({
  checked,
  onChange,
  label = '',
  disabled = false,
  size = 'medium',
  color = 'primary',
  ...props
}) => {
  const toggleVariants = {
    off: {
      background: 'var(--glass-white)',
      borderColor: 'var(--glass-border)'
    },
    on: {
      background: 'var(--primary-gradient)',
      borderColor: 'var(--primary-blue)'
    }
  };

  const knobVariants = {
    off: {
      x: 0,
      background: 'var(--glass-white)',
      boxShadow: 'var(--shadow-soft)'
    },
    on: {
      x: size === 'small' ? 12 : size === 'large' ? 20 : 16,
      background: 'white',
      boxShadow: 'var(--shadow-hover)'
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 18, knobSize: 12 };
      case 'large':
        return { width: 56, height: 28, knobSize: 20 };
      default:
        return { width: 44, height: 22, knobSize: 16 };
    }
  };

  const { width, height, knobSize } = getSize();

  return (
    <FormControlLabel
      control={
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <motion.div
            style={{
              width,
              height,
              borderRadius: height / 2,
              border: '2px solid',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              position: 'relative',
              overflow: 'hidden'
            }}
            variants={toggleVariants}
            animate={checked ? 'on' : 'off'}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
            onClick={() => !disabled && onChange && onChange(!checked)}
          >
            {/* Background shine effect */}
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              }}
              animate={{
                left: checked ? ['-100%', '100%'] : '-100%'
              }}
              transition={{
                duration: 0.6,
                ease: "easeOut"
              }}
            />

            {/* Toggle knob */}
            <motion.div
              style={{
                width: knobSize,
                height: knobSize,
                borderRadius: '50%',
                position: 'absolute',
                top: (height - knobSize) / 2,
                left: (height - knobSize) / 2,
                zIndex: 1
              }}
              variants={knobVariants}
              animate={checked ? 'on' : 'off'}
              transition={{
                type: "spring",
                stiffness: 700,
                damping: 35
              }}
            />

            {/* Ripple effect on click */}
            <motion.div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 0,
                height: 0,
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.3)',
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                width: checked ? [0, width * 2, 0] : 0,
                height: checked ? [0, height * 2, 0] : 0,
                opacity: checked ? [0, 0.5, 0] : 0
              }}
              transition={{ duration: 0.4 }}
            />

            {/* Hidden MUI Switch for accessibility */}
            <Switch
              checked={checked}
              onChange={onChange}
              disabled={disabled}
              sx={{
                position: 'absolute',
                opacity: 0,
                width: '100%',
                height: '100%',
                margin: 0,
                '& .MuiSwitch-switchBase': {
                  padding: 0,
                  '&.Mui-checked': {
                    transform: 'translateX(0)'
                  }
                },
                '& .MuiSwitch-track': {
                  opacity: 0
                },
                '& .MuiSwitch-thumb': {
                  opacity: 0
                }
              }}
              {...props}
            />
          </motion.div>

        </Box>
      }
      label={
        <motion.span
          animate={{
            color: checked ? 'var(--primary-blue)' : 'var(--text-secondary)'
          }}
          transition={{ duration: 0.3 }}
          style={{
            fontWeight: checked ? 600 : 400,
            marginLeft: 8
          }}
        >
          {label}
        </motion.span>
      }
      sx={{
        margin: 0,
        '& .MuiFormControlLabel-label': {
          fontSize: size === 'small' ? '0.875rem' : '1rem'
        }
      }}
    />
  );
};

export default AnimatedToggle;