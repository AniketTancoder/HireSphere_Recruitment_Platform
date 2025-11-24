import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const JobCard = ({ job, onApply }) => (
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
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            {job.title}
          </Typography>
          <Typography variant="subtitle1" color="primary" sx={{ mb: 1 }}>
            {job.company}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {job.location || 'Remote'}
              </Typography>
            </Box>
            {job.salary && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  ${job.salary.toLocaleString()}+
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Typography variant="body2" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {job.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {job.requiredSkills?.slice(0, 3).map((skill, index) => (
            <Chip key={index} label={skill} size="small" variant="outlined" />
          ))}
          {job.requiredSkills?.length > 3 && (
            <Chip label={`+${job.requiredSkills.length - 3} more`} size="small" variant="outlined" />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </Typography>

          {job.applicationStatus ? (
            <Chip
              label={job.applicationStatus.replace('_', ' ')}
              color={
                job.applicationStatus === 'submitted' ? 'default' :
                job.applicationStatus === 'under_review' ? 'warning' :
                job.applicationStatus === 'shortlisted' ? 'info' : 'success'
              }
              size="small"
            />
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onApply(job);
              }}
            >
              Quick Apply
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    search: '',
    location: '',
    skills: '',
    jobType: '',
    experience: '',
    salary_min: '',
    salary_max: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0
  });
  const [applyDialog, setApplyDialog] = useState({ open: false, job: null });
  const [applying, setApplying] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadJobs();
  }, [searchParams]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(`http://localhost:5000/api/candidate/jobs?${queryParams}`);
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (event, page) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setSearchParams({
      search: '',
      location: '',
      skills: '',
      jobType: '',
      experience: '',
      salary_min: '',
      salary_max: '',
      page: 1,
      limit: 12
    });
  };

  const handleJobClick = (jobId) => {
    navigate(`/candidate/jobs/${jobId}`);
  };

  const handleApplyClick = (job) => {
    setApplyDialog({ open: true, job });
  };

  const handleApplyConfirm = async () => {
    if (!applyDialog.job) return;

    try {
      setApplying(true);
      await axios.post(`http://localhost:5000/api/candidate/jobs/${applyDialog.job._id}/apply`, {
        applicationData: {
          coverLetter: '',
          expectedSalary: null,
          availability: 'negotiable'
        }
      });

      // Refresh jobs to update application status
      loadJobs();
      setApplyDialog({ open: false, job: null });
    } catch (error) {
      console.error('Error applying to job:', error);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Find Your Dream Job
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Discover opportunities that match your skills and career goals
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search jobs, companies, or keywords..."
                value={searchParams.search}
                onChange={(e) => handleSearchChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Location"
                value={searchParams.location}
                onChange={(e) => handleSearchChange('location', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Skills (e.g., React, Python, AWS)"
                value={searchParams.skills}
                onChange={(e) => handleSearchChange('skills', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={searchParams.jobType}
                  onChange={(e) => handleSearchChange('jobType', e.target.value)}
                  label="Job Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="full-time">Full Time</MenuItem>
                  <MenuItem value="part-time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="freelance">Freelance</MenuItem>
                  <MenuItem value="internship">Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Experience Level</InputLabel>
                <Select
                  value={searchParams.experience}
                  onChange={(e) => handleSearchChange('experience', e.target.value)}
                  label="Experience Level"
                >
                  <MenuItem value="">Any Experience</MenuItem>
                  <MenuItem value="0-2">Entry Level (0-2 years)</MenuItem>
                  <MenuItem value="3-5">Mid Level (3-5 years)</MenuItem>
                  <MenuItem value="6-10">Senior Level (6-10 years)</MenuItem>
                  <MenuItem value="10+">Expert Level (10+ years)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                placeholder="Min Salary"
                value={searchParams.salary_min}
                onChange={(e) => handleSearchChange('salary_min', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                placeholder="Max Salary"
                value={searchParams.salary_max}
                onChange={(e) => handleSearchChange('salary_max', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                sx={{ height: '56px' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {loading ? 'Loading jobs...' : `${pagination.total} jobs found`}
        </Typography>
      </Box>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Job Cards */}
      {!loading && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {jobs.map((job) => (
              <Grid item xs={12} md={6} lg={4} key={job._id}>
                <div onClick={() => handleJobClick(job._id)}>
                  <JobCard job={job} onApply={handleApplyClick} />
                </div>
              </Grid>
            ))}
          </Grid>

          {/* No Results */}
          {jobs.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No jobs found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Try adjusting your search criteria or check back later for new opportunities.
              </Typography>
            </Box>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Apply Confirmation Dialog */}
      <Dialog open={applyDialog.open} onClose={() => setApplyDialog({ open: false, job: null })}>
        <DialogTitle>Apply to {applyDialog.job?.title}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to apply to <strong>{applyDialog.job?.title}</strong> at <strong>{applyDialog.job?.company}</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Your profile information will be submitted with this application.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialog({ open: false, job: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleApplyConfirm}
            variant="contained"
            disabled={applying}
          >
            {applying ? 'Applying...' : 'Apply Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobBoard;