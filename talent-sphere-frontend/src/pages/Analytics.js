import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const StatCard = ({ title, value, subtitle, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          </Box>
          <Box sx={{ color: color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const Analytics = () => {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    totalJobs: 0,
    avgMatchScore: 0,
    aiAnalyses: 0,
    // Enhanced metrics
    pipelineHealth: 0,
    timeToHire: 0,
    diversityScore: 0,
    biasRisk: 0,
    topSkills: [],
    hiringVelocity: 0,
    candidateQuality: 0
  });
  const [insights, setInsights] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [candidatesRes, jobsRes, healthRes] = await Promise.all([
        axios.get('http://localhost:5000/api/candidates'),
        axios.get('http://localhost:5000/api/jobs'),
        axios.get('http://localhost:5000/api/admin/analytics/pipeline-health')
      ]);

      const candidates = candidatesRes.data;
      const jobs = jobsRes.data;
      const healthData = healthRes.data;

      // Enhanced analytics calculations using pipeline health from the monitoring system
      const analytics = calculateAdvancedAnalytics(candidates, jobs, healthData);

      setStats(analytics.stats);
      setInsights(analytics.insights);
      setPredictions(analytics.predictions);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAdvancedAnalytics = (candidates, jobs, healthData) => {
    const totalCandidates = candidates.length;
    const totalJobs = jobs.length;

    // Enhanced match score calculation
    const candidatesWithScores = candidates.filter(c => c.aiAnalysis?.matchScore);
    const avgMatchScore = candidatesWithScores.length > 0
      ? candidatesWithScores.reduce((sum, c) => sum + c.aiAnalysis.matchScore, 0) / candidatesWithScores.length
      : 0;

    // Use pipeline health from the monitoring system instead of calculating locally
    const pipelineHealth = healthData ? healthData.healthScore : 0;

    // Diversity and bias analysis
    const jobsWithBiasAnalysis = jobs.filter(j => j.aiAnalysis);
    const avgBiasScore = jobsWithBiasAnalysis.length > 0
      ? jobsWithBiasAnalysis.reduce((sum, j) => sum + j.aiAnalysis.biasScore, 0) / jobsWithBiasAnalysis.length
      : 100;

    // Use diversity score from pipeline health monitoring if available
    const diversityScore = healthData?.metrics?.diversityHealth || avgBiasScore;

    // Top skills analysis
    const allSkills = candidates.flatMap(c => c.skills || []);
    const skillCounts = allSkills.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});
    const topSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));

    // Hiring velocity (simulated)
    const hiringVelocity = Math.min(100, (totalCandidates / Math.max(totalJobs, 1)) * 20);

    // Candidate quality score
    const qualityScore = candidatesWithScores.length > 0
      ? (candidatesWithScores.filter(c => c.aiAnalysis.matchScore >= 70).length / candidatesWithScores.length) * 100
      : 0;

    // Generate insights
    const insights = generateInsights({
      totalCandidates,
      totalJobs,
      avgMatchScore,
      pipelineHealth,
      avgBiasScore,
      topSkills,
      hiringVelocity,
      qualityScore
    });

    // Generate predictions
    const predictions = generatePredictions({
      candidates,
      jobs,
      avgMatchScore,
      pipelineHealth
    });

    return {
      stats: {
        totalCandidates,
        totalJobs,
        avgMatchScore: Math.round(avgMatchScore),
        aiAnalyses: candidatesWithScores.length,
        pipelineHealth: Math.round(pipelineHealth),
        timeToHire: Math.round(45 - (pipelineHealth / 10)), // Simulated
        diversityScore: Math.round(diversityScore),
        biasRisk: Math.round(100 - avgBiasScore),
        topSkills,
        hiringVelocity: Math.round(hiringVelocity),
        candidateQuality: Math.round(qualityScore)
      },
      insights,
      predictions
    };
  };

  const generateInsights = (data) => {
    const insights = [];

    if (data.pipelineHealth < 50) {
      insights.push({
        type: 'warning',
        title: 'Pipeline Health Critical',
        message: 'Your candidate pipeline is running low. Consider posting more jobs or sourcing additional candidates.',
        action: 'Post new jobs or activate candidate rediscovery'
      });
    }

    if (data.avgMatchScore < 60) {
      insights.push({
        type: 'info',
        title: 'Matching Optimization Needed',
        message: 'Average match scores are below optimal. Consider refining job requirements or expanding candidate search.',
        action: 'Review job descriptions and candidate criteria'
      });
    }

    if (data.biasRisk > 50) {
      insights.push({
        type: 'error',
        title: 'Bias Risk Detected',
        message: 'Job postings contain potentially biased language. This may limit diverse candidate applications.',
        action: 'Review and update job descriptions for inclusivity'
      });
    }

    if (data.hiringVelocity > 80) {
      insights.push({
        type: 'success',
        title: 'High Hiring Velocity',
        message: 'Excellent candidate-to-job ratio indicates strong market positioning.',
        action: 'Consider expanding team or opening additional positions'
      });
    }

    return insights;
  };

  const generatePredictions = (data) => {
    const predictions = [];

    // Time-to-hire prediction
    const avgTimeToHire = data.avgMatchScore > 70 ? 30 : data.avgMatchScore > 50 ? 45 : 60;
    predictions.push({
      metric: 'Time to Hire',
      current: `${avgTimeToHire} days`,
      trend: data.pipelineHealth > 60 ? 'improving' : 'stable',
      confidence: 'High'
    });

    // Fill rate prediction
    const fillRate = Math.min(100, data.candidates.length > 0 ?
      (data.jobs.filter(j => j.status === 'closed').length / data.jobs.length) * 100 + 20 : 0);
    predictions.push({
      metric: 'Job Fill Rate',
      current: `${Math.round(fillRate)}%`,
      trend: data.pipelineHealth > 50 ? 'increasing' : 'stable',
      confidence: 'Medium'
    });

    // Candidate quality prediction
    const qualityTrend = data.avgMatchScore > 65 ? 'improving' : 'stable';
    predictions.push({
      metric: 'Candidate Quality',
      current: data.avgMatchScore > 70 ? 'High' : data.avgMatchScore > 50 ? 'Medium' : 'Low',
      trend: qualityTrend,
      confidence: 'High'
    });

    return predictions;
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Predictive Analytics Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        AI-powered insights for intelligent recruitment decisions
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pipeline Health"
            value={`${stats.pipelineHealth}%`}
            subtitle={stats.pipelineHealth > 70 ? "Healthy" : stats.pipelineHealth > 40 ? "Needs Attention" : "Critical"}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color={stats.pipelineHealth > 70 ? "#10b981" : stats.pipelineHealth > 40 ? "#f59e0b" : "#ef4444"}
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Match Score"
            value={`${stats.avgMatchScore}%`}
            subtitle="Multi-dimensional AI matching"
            icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
            color="#2563eb"
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bias Risk Level"
            value={`${stats.biasRisk}%`}
            subtitle={stats.biasRisk > 60 ? "High Risk" : stats.biasRisk > 30 ? "Medium Risk" : "Low Risk"}
            icon={<WarningIcon sx={{ fontSize: 40 }} />}
            color={stats.biasRisk > 60 ? "#ef4444" : stats.biasRisk > 30 ? "#f59e0b" : "#10b981"}
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Hiring Velocity"
            value={`${stats.hiringVelocity}%`}
            subtitle="Candidate-to-job efficiency"
            icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
            color="#8b5cf6"
            delay={0.3}
          />
        </Grid>
      </Grid>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <InsightsIcon sx={{ mr: 1 }} />
                  AI-Powered Insights
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {insights.map((insight, index) => (
                    <Alert
                      key={index}
                      severity={insight.type}
                      sx={{ '& .MuiAlert-message': { width: '100%' } }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {insight.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {insight.message}
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        💡 {insight.action}
                      </Typography>
                    </Alert>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Predictions and Analytics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Predictive Analytics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {predictions.map((prediction, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {prediction.metric}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {prediction.current}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        label={prediction.trend}
                        size="small"
                        color={prediction.trend === 'improving' ? 'success' : 'default'}
                      />
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                        {prediction.confidence} confidence
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Skills in Demand
              </Typography>
              {stats.topSkills.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {stats.topSkills.map((skillData, index) => (
                    <Chip
                      key={index}
                      label={`${skillData.skill} (${skillData.count})`}
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Add candidates to see skill demand analytics
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Recruitment Health Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="body2">Overall Health:</Typography>
                <Chip
                  label={`${Math.round((stats.pipelineHealth + stats.candidateQuality + (100 - stats.biasRisk)) / 3)}%`}
                  color={stats.pipelineHealth > 60 ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`Quality: ${stats.candidateQuality}%`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<PeopleIcon />}
                  label={`Pipeline: ${stats.pipelineHealth}%`}
                  size="small"
                  color={stats.pipelineHealth > 60 ? 'success' : 'warning'}
                  variant="outlined"
                />
                <Chip
                  icon={<AssessmentIcon />}
                  label={`Diversity: ${stats.diversityScore}%`}
                  size="small"
                  color={stats.diversityScore > 70 ? 'success' : 'warning'}
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actionable Recommendations */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Automated Workflow Suggestions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stats.totalJobs > 0 && stats.totalCandidates < stats.totalJobs * 3 && (
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Recommendation:</strong> Your candidate pool is smaller than optimal.
                      Consider using the candidate rediscovery feature to find overlooked matches for existing jobs.
                    </Typography>
                  </Alert>
                )}

                {stats.biasRisk > 40 && (
                  <Alert severity="warning">
                    <Typography variant="body2">
                      <strong>Recommendation:</strong> High bias risk detected in job postings.
                      Review job descriptions and consider using the enhanced bias detection tool for improvements.
                    </Typography>
                  </Alert>
                )}

                {stats.pipelineHealth < 50 && (
                  <Alert severity="error">
                    <Typography variant="body2">
                      <strong>Urgent:</strong> Recruitment pipeline health is critical.
                      Immediate action needed: Post new jobs, activate candidate sourcing, or review hiring criteria.
                    </Typography>
                  </Alert>
                )}

                {stats.avgMatchScore > 75 && (
                  <Alert severity="success">
                    <Typography variant="body2">
                      <strong>Excellent:</strong> Your matching algorithm is performing well!
                      Consider sharing successful job posting templates and candidate sourcing strategies.
                    </Typography>
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;