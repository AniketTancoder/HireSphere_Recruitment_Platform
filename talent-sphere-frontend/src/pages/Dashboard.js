import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    avgMatchScore: 0,
    recentMatches: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [candidatesRes, jobsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/candidates'),
        axios.get('http://localhost:5000/api/jobs')
      ]);

      const candidates = candidatesRes.data;
      const jobs = jobsRes.data;

      const totalCandidates = candidates.length;
      const activeJobs = jobs.filter(job => job.status === 'open').length;

      const candidatesWithScores = candidates.filter(c => c.aiAnalysis?.matchScore);
      const avgMatchScore = candidatesWithScores.length > 0
        ? candidatesWithScores.reduce((sum, c) => sum + c.aiAnalysis.matchScore, 0) / candidatesWithScores.length
        : 0;

      setStats({
        totalCandidates,
        activeJobs,
        avgMatchScore: Math.round(avgMatchScore),
        recentMatches: candidates.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Welcome to HireSphere Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Total Candidates
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.totalCandidates}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    In database
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Active Jobs
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.activeJobs}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Open positions
                  </Typography>
                </Box>
                <WorkIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Avg Match Score
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.avgMatchScore}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    AI-powered matching
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    AI Analysis
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    100%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Bias detection active
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/admin/jobs')}
                >
                  Post Job
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/analytics')}
                >
                  View Analytics
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Recent Candidate Matches
              </Typography>

              {stats.recentMatches.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {stats.recentMatches.slice(0, 3).map((candidate, index) => (
                    <Card key={candidate._id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {candidate.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {candidate.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {candidate.currentTitle || 'Candidate'}
                            </Typography>
                          </Box>
                        </Box>

                        {candidate.aiAnalysis?.matchScore && (
                          <Box sx={{ mb: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={candidate.aiAnalysis.matchScore}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: candidate.aiAnalysis.matchScore >= 80 ? 'success.main' :
                                                 candidate.aiAnalysis.matchScore >= 60 ? 'warning.main' : 'error.main',
                                  borderRadius: 4
                                }
                              }}
                            />
                            <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
                              {candidate.aiAnalysis.matchScore}% Match
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {candidate.skills?.slice(0, 3).map((skill, skillIndex) => (
                            <Chip
                              key={skillIndex}
                              label={skill.skill?.displayName || skill.skill?.name || skill}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  No candidates yet. Add some candidates to see matches.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;