import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextField, Box, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const AnimatedInput = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  helperText,
  required = false,
  multiline = false,
  rows = 1,
  startIcon,
  endIcon,
  delay = 0,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasContent, setHasContent] = useState(!!value);

  useEffect(() => {
    setHasContent(!!value);
  }, [value]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const labelVariants = {
    unfocused: {
      y: hasContent ? -24 : 0,
      scale: hasContent ? 0.85 : 1,
      color: hasContent ? 'var(--primary-blue)' : 'var(--text-secondary)'
    },
    focused: {
      y: -24,
      scale: 0.85,
      color: error ? '#ef4444' : 'var(--primary-blue)'
    }
  };

  const inputVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay
      }
    }
  };

  const underlineVariants = {
    unfocused: {
      scaleX: 0,
      background: 'var(--glass-border)'
    },
    focused: {
      scaleX: 1,
      background: error ? '#ef4444' : 'var(--primary-gradient)'
    }
  };

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <motion.div
      variants={inputVariants}
      initial="initial"
      animate="animate"
      style={{ position: 'relative', width: '100%' }}
    >
      <Box sx={{ position: 'relative' }}>
        {/* Animated Label */}
        <motion.label
          style={{
            position: 'absolute',
            left: startIcon ? 48 : 16,
            top: 16,
            pointerEvents: 'none',
            zIndex: 1,
            fontSize: '1rem',
            fontWeight: 400,
            color: 'var(--text-secondary)',
            background: 'transparent',
            padding: '0 4px',
            transition: 'all var(--duration-normal) var(--ease-spring)'
          }}
          variants={labelVariants}
          animate={isFocused || hasContent ? 'focused' : 'unfocused'}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {label}
          {required && <span style={{ color: '#ef4444' }}> *</span>}
        </motion.label>

        {/* Animated Input Field */}
        <motion.div
          animate={{
            boxShadow: isFocused
              ? 'var(--shadow-glow)'
              : error
                ? '0 0 0 2px rgba(239, 68, 68, 0.2)'
                : 'var(--shadow-soft)'
          }}
          transition={{ duration: 0.3 }}
        >
          <TextField
            type={inputType}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            error={error}
            helperText={helperText}
            multiline={multiline}
            rows={rows}
            InputProps={{
              startAdornment: startIcon && (
                <InputAdornment position="start">
                  <motion.div
                    animate={{
                      color: isFocused ? 'var(--primary-blue)' : 'var(--text-secondary)'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {startIcon}
                  </motion.div>
                </InputAdornment>
              ),
              endAdornment: (endIcon || isPassword) && (
                <InputAdornment position="end">
                  {isPassword ? (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': {
                            color: 'var(--primary-blue)',
                            background: 'var(--glass-blue)'
                          }
                        }}
                      >
                        <AnimatePresence mode="wait">
                          {showPassword ? (
                            <motion.div
                              key="visible"
                              initial={{ rotate: -90, opacity: 0 }}
                              animate={{ rotate: 0, opacity: 1 }}
                              exit={{ rotate: 90, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <VisibilityOff />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="hidden"
                              initial={{ rotate: 90, opacity: 0 }}
                              animate={{ rotate: 0, opacity: 1 }}
                              exit={{ rotate: -90, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Visibility />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </IconButton>
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{
                        color: isFocused ? 'var(--primary-blue)' : 'var(--text-secondary)'
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {endIcon}
                    </motion.div>
                  )}
                </InputAdornment>
              )
            }}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                background: 'var(--glass-white)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)',
                transition: 'all var(--duration-normal) var(--ease-spring)',
                '& fieldset': {
                  border: 'none'
                },
                '&:hover': {
                  borderColor: 'var(--glass-border-light)',
                  background: 'var(--glass-white)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--glass-border-light)'
                  }
                },
                '&.Mui-focused': {
                  borderColor: error ? '#ef4444' : 'var(--glass-border-glow)',
                  boxShadow: error
                    ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
                    : 'var(--shadow-glow)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: error ? '#ef4444' : 'var(--primary-blue)'
                  }
                }
              },
              '& .MuiInputBase-input': {
                color: 'var(--text-primary)',
                padding: '16px 14px',
                fontSize: '1rem',
                '&::placeholder': {
                  color: 'transparent'
                }
              },
              '& .MuiFormHelperText-root': {
                color: error ? '#ef4444' : 'var(--text-secondary)',
                marginLeft: 0,
                marginTop: 8,
                fontSize: '0.875rem'
              }
            }}
            {...props}
          />
        </motion.div>

        {/* Animated Underline */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            borderRadius: 1,
            transformOrigin: 'center'
          }}
          variants={underlineVariants}
          animate={isFocused || hasContent ? 'focused' : 'unfocused'}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />

      </Box>
    </motion.div>
  );
};

export default AnimatedInput;