import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormHelperText,
  Switch,
  FormControlLabel,
  Alert,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

const StatusUpdateModal = ({
  open,
  onClose,
  application,
  onStatusUpdate,
  loading = false
}) => {
  const [status, setStatus] = useState(application?.status || '');
  const [notes, setNotes] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [localLoading, setLocalLoading] = useState(false);

  const statusOptions = [
    { value: 'applied', label: 'Applied', color: 'default' },
    { value: 'under_review', label: 'Under Review', color: 'info' },
    { value: 'shortlisted', label: 'Shortlisted', color: 'success' },
    { value: 'interview_scheduled', label: 'Interview Scheduled', color: 'primary' },
    { value: 'interviewed', label: 'Interviewed', color: 'secondary' },
    { value: 'rejected', label: 'Rejected', color: 'error' },
    { value: 'selected', label: 'Selected', color: 'success' },
    { value: 'hired', label: 'Hired', color: 'success' },
    { value: 'withdrawn', label: 'Withdrawn', color: 'warning' },
  ];

  const emailEligibleStatuses = ['shortlisted', 'rejected', 'selected'];

  const handleSubmit = async () => {
    if (!status) return;

    setLocalLoading(true);
    try {
      const result = await onStatusUpdate({
        applicationId: application._id,
        status,
        notes: notes.trim() || undefined,
        sendEmail: sendEmail && emailEligibleStatuses.includes(status)
      });

      // Reset form
      setNotes('');
      setSendEmail(true);
      onClose();
    } catch (error) {
      console.error('Status update failed:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleClose = () => {
    if (!localLoading) {
      setStatus(application?.status || '');
      setNotes('');
      setSendEmail(true);
      onClose();
    }
  };

  const getStatusInfo = (statusValue) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option || { label: statusValue, color: 'default' };
  };

  const currentStatusInfo = getStatusInfo(application?.status);
  const newStatusInfo = getStatusInfo(status);

  const emailEligible = emailEligibleStatuses.includes(status);
  const isLoading = loading || localLoading;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isLoading}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        Update Application Status
        {application && (
          <Chip
            label={application.candidateId?.name || 'Unknown Candidate'}
            size="small"
            variant="outlined"
            sx={{ ml: 'auto' }}
          />
        )}
      </DialogTitle>

      <DialogContent>
        {application && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Current Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={currentStatusInfo.label}
                color={currentStatusInfo.color}
                size="small"
              />
              <Typography variant="body2" color="textSecondary">
                for {application.jobId?.title || 'Unknown Position'}
              </Typography>
            </Box>
          </Box>
        )}

        <FormControl fullWidth margin="normal" required>
          <InputLabel>New Status</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            label="New Status"
            disabled={isLoading}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={option.label}
                    color={option.color}
                    size="small"
                    sx={{ minWidth: 100 }}
                  />
                </Box>
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            Select the new status for this application
          </FormHelperText>
        </FormControl>

        {status && status !== application?.status && (
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2">
              Status will change from <strong>{currentStatusInfo.label}</strong> to{' '}
              <strong>{newStatusInfo.label}</strong>
            </Typography>
          </Alert>
        )}

        {emailEligible && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  color="primary"
                  disabled={isLoading}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" />
                  <Typography variant="body2">
                    Send automated email to candidate
                  </Typography>
                </Box>
              }
            />

            {sendEmail && (
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {status === 'shortlisted' && '📧 Interview invitation email will be sent'}
                  {status === 'rejected' && '📧 Polite rejection email will be sent'}
                  {status === 'selected' && '📧 Job offer email will be sent'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Email will be sent to: <strong>{application?.candidateId?.email}</strong>
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Internal Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add internal notes about this status change..."
          sx={{ mt: 2 }}
          disabled={isLoading}
          helperText="These notes are for internal use only"
        />

        {status === 'rejected' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Rejection Notice:</strong> Consider adding constructive feedback in the notes for future reference.
            </Typography>
          </Alert>
        )}

        {status === 'selected' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Congratulations!</strong> The candidate will receive a formal job offer email.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!status || status === application?.status || isLoading}
          startIcon={emailEligible && sendEmail ? <EmailIcon /> : null}
        >
          {isLoading ? 'Updating...' : 'Update Status'}
          {emailEligible && sendEmail && ' & Send Email'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusUpdateModal;