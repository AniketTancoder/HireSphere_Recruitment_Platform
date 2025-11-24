import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const HealthRecommendations = ({ compact = false }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/analytics/pipeline-health');
      const healthData = response.data;

      if (healthData.recommendations) {
        setRecommendations(healthData.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (rec) => {
    if (rec.toLowerCase().includes('candidate') || rec.toLowerCase().includes('diversity')) {
      return <PeopleIcon color="primary" />;
    }
    if (rec.toLowerCase().includes('time') || rec.toLowerCase().includes('schedule')) {
      return <ScheduleIcon color="secondary" />;
    }
    if (rec.toLowerCase().includes('job') || rec.toLowerCase().includes('posting')) {
      return <TrendingUpIcon color="success" />;
    }
    return <AssessmentIcon color="warning" />;
  };

  const getRecommendationPriority = (rec) => {
    if (rec.toLowerCase().includes('post') || rec.toLowerCase().includes('activate')) {
      return 'high';
    }
    if (rec.toLowerCase().includes('review') || rec.toLowerCase().includes('optimize')) {
      return 'medium';
    }
    return 'low';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const handleActionClick = (action) => {
    // Handle different action types
    console.log('Action clicked:', action);
    // In a real app, this would navigate or trigger specific actions
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            AI Recommendations
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Loading recommendations...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            AI Recommendations
          </Typography>
          <Alert severity="success">
            <Typography variant="body2">
              Your pipeline is healthy! No immediate recommendations needed.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <LightbulbIcon sx={{ mr: 1 }} />
            Quick Recommendations
          </Typography>

          <List dense>
            {recommendations.slice(0, 3).map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getRecommendationIcon(rec)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {rec}
                      </Typography>
                    }
                  />
                  <Chip
                    label={getRecommendationPriority(rec)}
                    size="small"
                    color={getPriorityColor(getRecommendationPriority(rec))}
                    sx={{ ml: 1 }}
                  />
                </ListItem>
              </motion.div>
            ))}
          </List>

          {recommendations.length > 3 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button size="small" color="primary">
                View All {recommendations.length} Recommendations
              </Button>
            </Box>
          )}
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
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <LightbulbIcon sx={{ mr: 1, color: 'warning.main' }} />
            AI-Powered Recommendations
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Based on your current pipeline health metrics, here are actionable recommendations to improve your recruitment performance.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>💡 Pro Tip:</strong> Implementing these recommendations can improve your pipeline health score by up to 25%.
              </Typography>
            </Alert>
          </Box>

          <List>
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListItem
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    {getRecommendationIcon(rec)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {rec}
                        </Typography>
                        <Chip
                          label={getRecommendationPriority(rec)}
                          size="small"
                          color={getPriorityColor(getRecommendationPriority(rec))}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="textSecondary">
                        {getRecommendationPriority(rec) === 'high'
                          ? 'High impact - Address immediately'
                          : getRecommendationPriority(rec) === 'medium'
                          ? 'Medium impact - Plan to implement soon'
                          : 'Low impact - Consider when resources allow'
                        }
                      </Typography>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleActionClick('implement')}
                    >
                      Implement
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleActionClick('learn_more')}
                    >
                      Learn More
                    </Button>
                  </Box>
                </ListItem>
              </motion.div>
            ))}
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Implementation Guide
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                  Quick Wins (5-15 minutes)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Post additional jobs to increase candidate flow
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Enable quick apply features on job postings
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Promote jobs on social media platforms
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                  Medium-term Improvements (1-2 weeks)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Review and optimize job descriptions for SEO
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Simplify application process and forms
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Partner with diverse candidate networks
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon sx={{ mr: 1, color: 'warning.main' }} />
                  Long-term Strategies (1-3 months)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Implement blind recruitment practices
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Train recruiters on unconscious bias
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Review screening process bottlenecks
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Alert severity="success">
            <Typography variant="body2">
              <strong>Track Your Progress:</strong> Revisit this page after implementing recommendations to see how your pipeline health improves.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HealthRecommendations;