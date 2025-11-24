import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Work as WorkIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Compare as CompareIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const MatchScore = ({ score, size = 'medium' }) => {
  const getColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Poor Match';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip
        label={`${score}%`}
        color={getColor(score)}
        size={size}
        sx={{ fontWeight: 'bold' }}
      />
      <Typography variant="caption" color="textSecondary">
        {getLabel(score)}
      </Typography>
    </Box>
  );
};

const CandidateMatchCard = ({ match, onViewDetails, onInviteInterview }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card sx={{
      height: '100%',
      cursor: 'pointer',
      '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
      transition: 'all 0.2s ease-in-out'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            {match.candidate.firstName?.[0]}{match.candidate.lastName?.[0]}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">
              {match.candidate.firstName} {match.candidate.lastName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {match.candidate.currentTitle} • {match.candidate.experience} years exp
            </Typography>
          </Box>
          <MatchScore score={match.matchScore} />
        </Box>

        <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold' }}>
          Matching Skills:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {match.matchingSkills?.slice(0, 3).map((skill, index) => (
            <Chip key={index} label={skill} size="small" color="success" variant="outlined" />
          ))}
          {match.matchingSkills?.length > 3 && (
            <Chip label={`+${match.matchingSkills.length - 3} more`} size="small" variant="outlined" />
          )}
        </Box>

        {match.missingSkills && match.missingSkills.length > 0 && (
          <>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', color: 'warning.main' }}>
              Missing Skills:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {match.missingSkills.slice(0, 2).map((skill, index) => (
                <Chip key={index} label={skill} size="small" color="warning" variant="outlined" />
              ))}
              {match.missingSkills.length > 2 && (
                <Chip label={`+${match.missingSkills.length - 2} more`} size="small" variant="outlined" />
              )}
            </Box>
          </>
        )}

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(match);
            }}
            sx={{ flex: 1 }}
          >
            View Profile
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<ScheduleIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onInviteInterview(match);
            }}
            sx={{ flex: 1 }}
          >
            Interview
          </Button>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const MatchingEngine = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleJobChange = async (jobId) => {
    setSelectedJob(jobId);
    if (!jobId) {
      setMatches([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs/${jobId}/matches`);
      setMatches(response.data);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (match) => {
    setSelectedMatch(match);
    setDetailsDialog(true);
  };

  const handleInviteInterview = async (match) => {
    // This would integrate with an interview scheduling system
    alert(`Interview invitation sent to ${match.candidate.firstName} ${match.candidate.lastName}`);
  };

  const handleCloseDetails = () => {
    setDetailsDialog(false);
    setSelectedMatch(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          AI Matching Engine
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Intelligent candidate-job matching powered by advanced algorithms
        </Typography>
      </Box>

      {/* Job Selection */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Job to Find Matches
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Job Position</InputLabel>
            <Select
              value={selectedJob}
              onChange={(e) => handleJobChange(e.target.value)}
              label="Select Job Position"
            >
              <MenuItem value="">
                <em>Choose a job...</em>
              </MenuItem>
              {jobs.map((job) => (
                <MenuItem key={job._id} value={job._id}>
                  {job.title} - {job.company} ({job.applications?.length || 0} applications)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedJob && (
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              {(() => {
                const job = jobs.find(j => j._id === selectedJob);
                return job ? (
                  <Box>
                    <Typography variant="h6">{job.title}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {job.company} • {job.location}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {job.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                        Required Skills:
                      </Typography>
                      {job.requiredSkills?.map((skill, index) => (
                        <Chip key={index} label={skill} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                ) : null;
              })()}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Matches Results */}
      {selectedJob && !loading && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Top Matches ({matches.length} candidates found)
          </Typography>

          {matches.length === 0 ? (
            <Alert severity="info">
              No matching candidates found for this job. Try adjusting job requirements or wait for more candidates to apply.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {matches.map((match, index) => (
                <Grid item xs={12} md={6} lg={4} key={match.candidate._id}>
                  <CandidateMatchCard
                    match={match}
                    onViewDetails={handleViewDetails}
                    onInviteInterview={handleInviteInterview}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Matching Insights */}
      {selectedJob && matches.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Matching Insights
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Excellent Matches (80%+):</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {matches.filter(m => m.matchScore >= 80).length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Good Matches (60-79%):</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {matches.filter(m => m.matchScore >= 60 && m.matchScore < 80).length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Average Match Score:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Skills Coverage
                </Typography>
                {(() => {
                  const job = jobs.find(j => j._id === selectedJob);
                  if (!job?.requiredSkills) return null;

                  const coverage = job.requiredSkills.map(skill => {
                    const coveredBy = matches.filter(m =>
                      m.matchingSkills?.includes(skill)
                    ).length;
                    return {
                      skill,
                      coverage: Math.round((coveredBy / matches.length) * 100)
                    };
                  });

                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {coverage.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">{item.skill}:</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={item.coverage}
                              sx={{ width: 60, height: 6 }}
                            />
                            <Typography variant="caption">{item.coverage}%</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  );
                })()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Candidate Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Match Details: {selectedMatch?.candidate.firstName} {selectedMatch?.candidate.lastName}
        </DialogTitle>
        <DialogContent>
          {selectedMatch && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Candidate Profile</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography><strong>Match Score:</strong> <MatchScore score={selectedMatch.matchScore} /></Typography>
                    <Typography><strong>Experience:</strong> {selectedMatch.candidate.experience} years</Typography>
                    <Typography><strong>Current Role:</strong> {selectedMatch.candidate.currentTitle}</Typography>
                    <Typography><strong>Company:</strong> {selectedMatch.candidate.currentCompany}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Matching Analysis</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography><strong>Matching Skills:</strong> {selectedMatch.matchingSkills?.length || 0}</Typography>
                    <Typography><strong>Missing Skills:</strong> {selectedMatch.missingSkills?.length || 0}</Typography>
                    <Typography><strong>Technical Fit:</strong> {selectedMatch.matchScore >= 70 ? 'Strong' : selectedMatch.matchScore >= 50 ? 'Moderate' : 'Weak'}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Skills Breakdown</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="success.main" gutterBottom>
                    ✅ Matching Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedMatch.matchingSkills?.map((skill, index) => (
                      <Chip key={index} label={skill} color="success" variant="outlined" />
                    )) || <Typography variant="body2" color="textSecondary">None</Typography>}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="warning.main" gutterBottom>
                    ⚠️ Missing Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedMatch.missingSkills?.map((skill, index) => (
                      <Chip key={index} label={skill} color="warning" variant="outlined" />
                    )) || <Typography variant="body2" color="textSecondary">None</Typography>}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
          <Button
            variant="contained"
            onClick={() => handleInviteInterview(selectedMatch)}
          >
            Schedule Interview
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MatchingEngine;