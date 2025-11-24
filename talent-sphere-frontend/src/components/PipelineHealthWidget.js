import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Button,
  Collapse,
  IconButton,
  Alert,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { usePipelineMetrics } from '../hooks/usePipelineMetrics';
import { METRICS_CONFIG } from '../constants/metricsConstants';

const PipelineHealthWidget = () => {
  const [expanded, setExpanded] = useState(false);
  const {
    health,
    metrics,
    alerts,
    recommendations,
    loading,
    error,
    refresh,
    recalculate
  } = usePipelineMetrics();

  const handleRefresh = async () => {
    await recalculate();
  };

  const handleQuickAction = (action) => {
    // Handle quick actions - in a real app, these would navigate or trigger specific actions
    console.log('Quick action triggered:', action);
    switch (action) {
      case 'navigateToJobCreation':
        // Navigate to job creation page
        break;
      case 'activateRediscovery':
        // Activate candidate rediscovery
        break;
      case 'showDetailedAnalytics':
        // Show detailed analytics
        break;
      default:
        break;
    }
  };


  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pipeline Health
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (error || !health) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pipeline Health
          </Typography>
          <Typography color="textSecondary">
            {error || 'Unable to load health data'}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          mb: 3,
          borderLeft: `4px solid ${health.color}`,
          backgroundColor: health.status === 'critical' ? 'rgba(239, 68, 68, 0.08)' :
                          health.status === 'warning' ? 'rgba(245, 158, 11, 0.08)' :
                          'rgba(16, 185, 129, 0.08)'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ mr: 1 }} />
              Pipeline Health
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Refresh health data">
                <IconButton
                  size="small"
                  onClick={handleRefresh}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* Health Score and Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ mr: 2, fontWeight: 'bold' }}>
              {health.score}%
            </Typography>
            <Chip
              icon={health.status === 'healthy' ? <CheckCircleIcon /> :
                    health.status === 'warning' ? <WarningIcon /> : <ErrorIcon />}
              label={health.label}
              color={health.status === 'healthy' ? 'success' :
                     health.status === 'warning' ? 'warning' : 'error'}
              size="small"
            />
          </Box>

          {/* Key Metrics */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {metrics.activeCandidates}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Active Candidates
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {metrics.weeklyApplications}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Weekly Applications
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {metrics.openPositions}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Open Positions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {metrics.avgTimeToFill || 0}d
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Avg Time to Fill
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Active Alerts */}
          {alerts && alerts.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {alerts.slice(0, 2).map((alert, index) => (
                <Alert
                  key={alert._id || index}
                  severity={alert.severity}
                  sx={{ mb: 1 }}
                  action={
                    alert.quickActions && alert.quickActions.length > 0 && (
                      <Button
                        size="small"
                        onClick={() => handleQuickAction(alert.quickActions[0].action)}
                      >
                        {alert.quickActions[0].label}
                      </Button>
                    )
                  }
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {alert.title}
                  </Typography>
                  <Typography variant="body2">
                    {alert.message}
                  </Typography>
                </Alert>
              ))}
            </Box>
          )}

          {/* Expandable Section */}
          <Collapse in={expanded}>
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon sx={{ mr: 1 }} />
                How Pipeline Health Monitoring Works
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  📊 Real-time Metrics Tracking
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  We continuously monitor 4 key metrics: candidate volume, application rate, time-to-fill, and diversity ratio. Each metric contributes to your overall pipeline health score.
                </Typography>

                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  🎯 Smart Threshold Detection
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  The system compares your current metrics against industry benchmarks and your historical performance. Alerts trigger when metrics fall below healthy thresholds.
                </Typography>

                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  💡 Actionable Recommendations
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Each alert includes specific, actionable steps to improve your pipeline health. Our AI analyzes your situation to provide tailored suggestions.
                </Typography>

                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  📈 Continuous Improvement
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  As you implement recommendations, the system learns what works best for your organization and refines future suggestions.
                </Typography>
              </Box>

              {/* Detailed Metrics */}
              <Typography variant="h6" gutterBottom>
                Detailed Metrics
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Candidate Volume Health
                    </Typography>
                    <Typography variant="h6">
                      {metrics.candidateVolume || 0}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.candidateVolume || 0}
                      color={(metrics.candidateVolume || 0) > 60 ? 'success' : 'warning'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Application Rate Health
                    </Typography>
                    <Typography variant="h6">
                      {metrics.applicationRate || 0}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.applicationRate || 0}
                      color={(metrics.applicationRate || 0) > 60 ? 'success' : 'warning'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Time to Fill Health
                    </Typography>
                    <Typography variant="h6">
                      {metrics.timeToFill || 0}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.timeToFill || 0}
                      color={(metrics.timeToFill || 0) > 60 ? 'success' : 'warning'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Diversity Health
                    </Typography>
                    <Typography variant="h6">
                      {metrics.diversityRatio || 0}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.diversityRatio || 0}
                      color={(metrics.diversityRatio || 0) > 60 ? 'success' : 'warning'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Recommendations */}
              {recommendations && recommendations.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  {recommendations.map((rec, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                      • {rec}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PipelineHealthWidget;