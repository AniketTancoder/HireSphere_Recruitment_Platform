import React from 'react';
import { motion } from 'framer-motion';

const StaggeredList = ({
  items,
  itemComponent: ItemComponent,
  className = '',
  staggerDelay = 0.1,
  initialDelay = 0,
  ...props
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      {...props}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id || index}
          variants={itemVariants}
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          whileTap={{
            scale: 0.98,
            transition: { duration: 0.1 }
          }}
        >
          {ItemComponent ? (
            <ItemComponent item={item} index={index} />
          ) : (
            <div className="staggered-list-item">
              {typeof item === 'string' ? item : JSON.stringify(item)}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Pre-built item components
export const ListItem = ({ item, index }) => (
  <div
    className="glass-card staggered-list-item"
    style={{
      marginBottom: 'var(--space-md)',
      padding: 'var(--space-md)',
      cursor: 'pointer'
    }}
  >
    {item.title && <h4 style={{ margin: 0, marginBottom: 'var(--space-sm)' }}>{item.title}</h4>}
    {item.description && <p style={{ margin: 0, color: '#64748b' }}>{item.description}</p>}
    {item.content && <div>{item.content}</div>}
  </div>
);

export const CardItem = ({ item, index }) => (
  <div
    className="glass-card staggered-card-item"
    style={{
      marginBottom: 'var(--space-lg)',
      padding: 'var(--space-lg)',
      cursor: 'pointer'
    }}
  >
    {item.icon && <div style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>{item.icon}</div>}
    {item.title && <h3 style={{ margin: 0, marginBottom: 'var(--space-sm)' }}>{item.title}</h3>}
    {item.subtitle && <h4 style={{ margin: 0, marginBottom: 'var(--space-md)', color: '#64748b' }}>{item.subtitle}</h4>}
    {item.description && <p style={{ margin: 0, lineHeight: 1.6 }}>{item.description}</p>}
    {item.actions && (
      <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)' }}>
        {item.actions}
      </div>
    )}
  </div>
);

export default StaggeredList;