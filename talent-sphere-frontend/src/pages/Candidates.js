import React, { useState, useEffect } from 'react';
import {
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import candidateService from '../services/candidateService';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, candidate: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const result = await candidateService.getCandidates();
      if (result.success) {
        setCandidates(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (candidate) => {
    setDeleteDialog({ open: true, candidate });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.candidate) return;

    try {
      const result = await candidateService.deleteCandidate(deleteDialog.candidate._id);
      if (result.success) {
        setCandidates(candidates.filter(c => c._id !== deleteDialog.candidate._id));
        setSuccess('Candidate deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to delete candidate');
    }
    setDeleteDialog({ open: false, candidate: null });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, candidate: null });
  };

  const handleViewResume = (candidate) => {
    if (candidate.resumeFile) {
      const resumeUrl = `http://localhost:5000/api/candidates/${candidate._id}/resume`;
      window.open(resumeUrl, '_blank');
    }
  };

  const handleDownloadResume = (candidate) => {
    if (candidate.resumeFile) {
      const resumeUrl = `http://localhost:5000/api/candidates/${candidate._id}/resume`;
      const link = document.createElement('a');
      link.href = resumeUrl;
      link.download = candidate.resumeFile;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Candidates ({candidates.length})
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Skills</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Match Score</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate._id}>
                    <TableCell>{candidate.name}</TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>
                      {candidate.skills?.slice(0, 3).map(s => s.skill?.displayName || s.skill?.name || 'Unknown').join(', ')}
                      {candidate.skills?.length > 3 && '...'}
                    </TableCell>
                    <TableCell>
                      {candidate.experience !== undefined && candidate.experience !== null ? `${candidate.experience} years` : 'Not specified'}
                    </TableCell>
                    <TableCell>
                      {candidate.aiAnalysis?.matchScore ? (
                        <Chip
                          label={`${candidate.aiAnalysis.matchScore}%`}
                          color={
                            candidate.aiAnalysis.matchScore >= 80 ? 'success' :
                            candidate.aiAnalysis.matchScore >= 60 ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Not analyzed
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {candidate.isPortalCandidate ? (
                          <>
                            <Chip
                              label="Portal Candidate"
                              color="info"
                              size="small"
                              variant="outlined"
                            />
                            {candidate.resumeFile && (
                              <>
                                <Button
                                  size="small"
                                  startIcon={<VisibilityIcon />}
                                  variant="outlined"
                                  onClick={() => handleViewResume(candidate)}
                                >
                                  View Resume
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<DownloadIcon />}
                                  variant="outlined"
                                  onClick={() => handleDownloadResume(candidate)}
                                >
                                  Download
                                </Button>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              variant="outlined"
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              color="error"
                              onClick={() => handleDeleteClick(candidate)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {candidates.length === 0 && (
            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No candidates found. Add your first candidate to get started.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Candidate</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {deleteDialog.candidate?.name}?
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
    </Box>
  );
};

export default Candidates;