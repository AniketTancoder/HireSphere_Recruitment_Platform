import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Typography,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const HealthAlert = ({
  alert,
  onAcknowledge,
  onResolve,
  onQuickAction,
  expanded: initialExpanded = false
}) => {
  const [expanded, setExpanded] = React.useState(initialExpanded);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      case 'info': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  const handleQuickAction = (action) => {
    if (onQuickAction) {
      onQuickAction(action);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Alert
        severity={getSeverityColor(alert.severity)}
        sx={{
          mb: 2,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {alert.quickActions && alert.quickActions.length > 0 && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleQuickAction(alert.quickActions[0].action)}
                sx={{ mr: 1 }}
              >
                {alert.quickActions[0].label}
              </Button>
            )}
            {alert.recommendations && alert.recommendations.length > 0 && (
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            {!alert.acknowledged && onAcknowledge && (
              <Button
                size="small"
                onClick={() => onAcknowledge(alert._id)}
              >
                Acknowledge
              </Button>
            )}
            {!alert.resolved && onResolve && (
              <Button
                size="small"
                color="success"
                onClick={() => onResolve(alert._id)}
              >
                Resolve
              </Button>
            )}
          </Box>
        }
      >
        <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getSeverityIcon(alert.severity)}
          {alert.title}
          {alert.acknowledged && (
            <Chip
              label="Acknowledged"
              size="small"
              color="default"
              sx={{ ml: 1 }}
            />
          )}
          {alert.resolved && (
            <Chip
              label="Resolved"
              size="small"
              color="success"
              sx={{ ml: 1 }}
            />
          )}
        </AlertTitle>

        <Typography variant="body2" sx={{ mb: 1 }}>
          {alert.message}
        </Typography>

        {/* Quick Actions */}
        {alert.quickActions && alert.quickActions.length > 1 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {alert.quickActions.slice(1).map((action, index) => (
              <Button
                key={index}
                size="small"
                variant="text"
                onClick={() => handleQuickAction(action.action)}
                sx={{ fontSize: '0.75rem' }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Expandable Recommendations */}
        {alert.recommendations && alert.recommendations.length > 0 && (
          <Collapse in={expanded}>
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Recommended Actions:
              </Typography>
              {alert.recommendations.map((rec, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    mb: 0.5,
                    pl: 2,
                    borderLeft: '2px solid rgba(255,255,255,0.3)',
                    fontStyle: 'italic'
                  }}
                >
                  • {rec}
                </Typography>
              ))}
            </Box>
          </Collapse>
        )}
      </Alert>
    </motion.div>
  );
};

export default HealthAlert;