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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Container,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import jobService from '../services/jobService';
import AddJob from './AddJob';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, job: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddJob, setShowAddJob] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const result = await jobService.getJobs();
      if (result.success) {
        setJobs(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (job) => {
    setDeleteDialog({ open: true, job });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.job) return;

    try {
      const result = await jobService.deleteJob(deleteDialog.job._id);
      if (result.success) {
        setJobs(jobs.filter(j => j._id !== deleteDialog.job._id));
        setSuccess('Job deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to delete job');
    }
    setDeleteDialog({ open: false, job: null });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, job: null });
  };

  const handleEditClick = (job) => {
    setEditingJob(job);
    setShowAddJob(true);
  };

  if (loading) {
    return <LinearProgress />;
  }

  // Handle successful job creation/update
  const handleJobCreated = () => {
    setShowAddJob(false);
    setEditingJob(null);
    fetchJobs(); // Refresh the jobs list
  };

  const handleCancelEdit = () => {
    setShowAddJob(false);
    setEditingJob(null);
  };

  return (
    <Box>
      {!showAddJob ? (
        // Jobs List View
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">
              Jobs Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddJob(true)}
              size="large"
            >
              Post New Job
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Card>
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Posted Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job._id}>
                        <TableCell>{job.title}</TableCell>
                        <TableCell>{job.company}</TableCell>
                        <TableCell>{job.location}</TableCell>
                        <TableCell>
                          <Chip
                            label={job.status || 'open'}
                            color={job.status === 'closed' ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(job.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              variant="outlined"
                              onClick={() => handleEditClick(job)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              color="error"
                              onClick={() => handleDeleteClick(job)}
                            >
                              Delete
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {jobs.length === 0 && (
                <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  No jobs posted yet. Click "Post New Job" to create your first job posting.
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialog.open}
            onClose={handleDeleteCancel}
          >
            <DialogTitle>Delete Job</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete "{deleteDialog.job?.title}"?
                This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel}>Cancel</Button>
              <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      ) : (
        // Add/Edit Job Form View - To the right of sidebar
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleCancelEdit}
              sx={{ mr: 2 }}
            >
              Back to Jobs
            </Button>
            <Typography variant="h4">
              {editingJob ? 'Edit Job' : 'Post New Job'}
            </Typography>
          </Box>

          <AddJob
            editingJob={editingJob}
            onJobCreated={handleJobCreated}
            onCancel={handleCancelEdit}
          />
        </Box>
      )}
    </Box>
  );
};

export default Jobs;