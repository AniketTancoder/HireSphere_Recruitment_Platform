import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  Tabs,
  Tab,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import axios from 'axios';
import PipelineHealthWidget from '../components/PipelineHealthWidget';
import HealthAlert from '../components/HealthAlert';
import { usePipelineMetrics } from '../hooks/usePipelineMetrics';

const PipelineAnalytics = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [trendsData, setTrendsData] = useState([]);
  const [metricsData, setMetricsData] = useState(null);
  const [thresholds, setThresholds] = useState(null);

  // Use centralized metrics hook
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

  useEffect(() => {
    fetchAdditionalData();
  }, []);

  const fetchAdditionalData = async () => {
    try {
      const [trendsRes, metricsRes, thresholdsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/analytics/health-trends?days=30'),
        axios.get('http://localhost:5000/api/admin/analytics/pipeline-metrics'),
        axios.get('http://localhost:5000/api/admin/analytics/health-thresholds')
      ]);

      let trends = trendsRes.data;

      // If no trends data, trigger a health calculation to create historical data
      if (!trends || trends.length === 0) {
        console.log('No trends data found, triggering health calculation...');
        await axios.post('http://localhost:5000/api/admin/analytics/calculate-health');

        // Fetch trends again after calculation
        const updatedTrendsRes = await axios.get('http://localhost:5000/api/admin/analytics/health-trends?days=30');
        trends = updatedTrendsRes.data;
      }

      // Sort trends data by date (oldest first for charts, newest first for table)
      const sortedTrends = trends.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setTrendsData(sortedTrends);
      setMetricsData(metricsRes.data);
      setThresholds(thresholdsRes.data);
    } catch (error) {
      console.error('Error fetching additional analytics data:', error);
    }
  };

  const handleRefresh = async () => {
    await recalculate();
    await fetchAdditionalData();
  };

  // Auto-refresh trends every 5 minutes for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAdditionalData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/analytics/alerts/${alertId}/acknowledge`);
      await refresh(); // Use the centralized refresh function
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/analytics/alerts/${alertId}/resolve`);
      await refresh(); // Use the centralized refresh function
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleQuickAction = (action) => {
    console.log('Quick action:', action);
    // Handle navigation or actions based on the action type
  };

  const formatTrendsData = (data) => {
    // Group by day and take the latest record for each day
    const groupedByDay = {};

    data.forEach(item => {
      const date = new Date(item.timestamp);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!groupedByDay[dayKey] || date > new Date(groupedByDay[dayKey].timestamp)) {
        groupedByDay[dayKey] = item;
      }
    });

    // Convert back to array and sort by date
    return Object.values(groupedByDay)
      .map(item => {
        const date = new Date(item.timestamp);
        return {
          date: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          fullDate: date.toISOString().split('T')[0], // YYYY-MM-DD for sorting
          timestamp: date.getTime(), // For better sorting
          healthScore: item.healthScore,
          status: item.status,
          candidates: item.metrics?.activeCandidates || 0,
          applications: item.metrics?.weeklyApplications || 0,
          timeToFill: item.metrics?.avgTimeToFill || 0
        };
      })
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate)); // Sort by date ascending
  };

  // Removed local getStatusColor - using centralized colors from METRICS_CONFIG

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Pipeline Analytics
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  const formattedTrends = formatTrendsData(trendsData);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Pipeline Analytics Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh Data
        </Button>
      </Box>

      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Comprehensive insights into your recruitment pipeline health and performance metrics
      </Typography>

      {/* Health Widget */}
      <PipelineHealthWidget />

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<TrendingUpIcon />} label="Trends" />
          <Tab icon={<AssessmentIcon />} label="Metrics" />
          <Tab icon={<TimelineIcon />} label="Historical" />
          <Tab icon={<SettingsIcon />} label="Settings" />
        </Tabs>

        {/* Trends Tab */}
        {activeTab === 0 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Health Score Trends (Day-wise - Last 30 Days)
            </Typography>
            <Box sx={{ height: 400, mb: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'healthScore' ? `${value}%` : value,
                      name === 'healthScore' ? 'Health Score' : name
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="healthScore"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Status Distribution
                    </Typography>
                    <Box sx={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                             { name: 'Healthy', value: trendsData.filter(d => d.status === 'healthy').length, color: '#10b981' },
                             { name: 'Warning', value: trendsData.filter(d => d.status === 'warning').length, color: '#f59e0b' },
                             { name: 'Critical', value: trendsData.filter(d => d.status === 'critical').length, color: '#ef4444' }
                           ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            dataKey="value"
                          >
                          {['#10b981', '#f59e0b', '#ef4444'].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Key Metrics Over Time
                    </Typography>
                    <Box sx={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formattedTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="candidates" stroke="#10b981" name="Active Candidates" />
                          <Line type="monotone" dataKey="applications" stroke="#f59e0b" name="Weekly Applications" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        )}

        {/* Metrics Tab */}
        {activeTab === 1 && metricsData && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Pipeline Metrics
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell align="right">Value</TableCell>
                        <TableCell align="right">Target</TableCell>
                        <TableCell align="right">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Total Candidates</TableCell>
                        <TableCell align="right">{metricsData.totalCandidates}</TableCell>
                        <TableCell align="right">-</TableCell>
                        <TableCell align="right">
                          <Chip label="Active" color="success" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Open Positions</TableCell>
                        <TableCell align="right">{metricsData.openJobs}</TableCell>
                        <TableCell align="right">-</TableCell>
                        <TableCell align="right">
                          <Chip label="Active" color="primary" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Weekly Applications</TableCell>
                        <TableCell align="right">{metricsData.weeklyApplications}</TableCell>
                        <TableCell align="right">{thresholds?.minWeeklyApplications || 20}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={metricsData.weeklyApplications >= (thresholds?.minWeeklyApplications || 20) ? 'Good' : 'Low'}
                            color={metricsData.weeklyApplications >= (thresholds?.minWeeklyApplications || 20) ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Candidate-to-Job Ratio</TableCell>
                        <TableCell align="right">{metricsData.candidateToJobRatio}:1</TableCell>
                        <TableCell align="right">15:1</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={parseFloat(metricsData.candidateToJobRatio) >= 15 ? 'Good' : 'Low'}
                            color={parseFloat(metricsData.candidateToJobRatio) >= 15 ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Health Breakdown
                    </Typography>
                    {metrics && (
                      <Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2">Candidate Volume Health</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={metrics.candidateVolume || 0}
                            color={(metrics.candidateVolume || 0) > 60 ? 'success' : 'warning'}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            {metrics.candidateVolume || 0}%
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2">Application Rate Health</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={metrics.applicationRate || 0}
                            color={(metrics.applicationRate || 0) > 60 ? 'success' : 'warning'}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            {metrics.applicationRate || 0}%
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2">Time to Fill Health</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={metrics.timeToFill || 0}
                            color={(metrics.timeToFill || 0) > 60 ? 'success' : 'warning'}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            {metrics.timeToFill || 0}%
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="body2">Diversity Health</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={metrics.diversityRatio || 0}
                            color={(metrics.diversityRatio || 0) > 60 ? 'success' : 'warning'}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            {metrics.diversityRatio || 0}%
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        )}

        {/* Historical Tab */}
        {activeTab === 2 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Historical Health Records (Last 15 Days)
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Health Score</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Active Candidates</TableCell>
                    <TableCell align="right">Weekly Apps</TableCell>
                    <TableCell align="right">Avg Time to Fill</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trendsData
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort by date descending (newest first)
                    .slice(0, 15) // Show last 15 days to avoid too many rows
                    .map((record, index) => (
                    <TableRow key={`${record.timestamp}-${index}`}>
                      <TableCell>
                        {new Date(record.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: '2-digit'
                        })}
                      </TableCell>
                      <TableCell align="right">{record.healthScore}%</TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={
                            record.status === 'healthy' ? 'success' :
                            record.status === 'warning' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {record.metrics?.activeCandidates || 0}
                      </TableCell>
                      <TableCell align="right">
                        {record.metrics?.weeklyApplications || 0}
                      </TableCell>
                      <TableCell align="right">
                        {record.metrics?.avgTimeToFill ? `${record.metrics.avgTimeToFill}d` : '0d'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}

        {/* Settings Tab */}
        {activeTab === 3 && thresholds && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Health Thresholds Configuration
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              These thresholds determine when alerts are triggered. Adjust them based on your organization's needs.
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Candidate Volume
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Minimum candidates per job: {thresholds.minCandidatesPerJob}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Critical threshold: {thresholds.criticalCandidatesPerJob}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Application Rate
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Minimum weekly applications: {thresholds.minWeeklyApplications}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Critical threshold: {thresholds.criticalWeeklyApplications}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Time to Fill
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Maximum days to fill: {thresholds.maxTimeToFill}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Critical threshold: {thresholds.criticalTimeToFill}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Diversity
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Minimum diversity ratio: {(thresholds.minDiversityRatio * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Critical threshold: {(thresholds.criticalDiversityRatio * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>

      {/* Active Alerts */}
      {alerts && alerts.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Alerts
            </Typography>
            {alerts.map((alert, index) => (
              <HealthAlert
                key={alert._id || index}
                alert={alert}
                onAcknowledge={handleAcknowledgeAlert}
                onResolve={handleResolveAlert}
                onQuickAction={handleQuickAction}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PipelineAnalytics;