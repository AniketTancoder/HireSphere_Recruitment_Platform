import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import axios from 'axios';

const EmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    emailType: 'all',
    limit: 50
  });
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchEmailLogs();
  }, [filter]);

  const fetchEmailLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filter.status !== 'all') params.append('status', filter.status);
      if (filter.emailType !== 'all') params.append('emailType', filter.emailType);
      if (filter.limit !== 50) params.append('limit', filter.limit);

      const response = await axios.get(`http://localhost:5000/api/admin/email/logs?${params}`);
      setLogs(response.data.logs || []);
      setStats(response.data.stats || stats);
    } catch (error) {
      console.error('Error fetching email logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchEmailLogs();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <CheckCircleIcon color="success" />;
      case 'failed': return <ErrorIcon color="error" />;
      case 'pending': return <ScheduleIcon color="warning" />;
      default: return <EmailIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getEmailTypeLabel = (type) => {
    const labels = {
      shortlisted: 'Interview Invitation',
      rejected: 'Rejection Notice',
      selected: 'Job Offer',
      interview_invitation: 'Interview Invitation',
      offer_followup: 'Offer Follow-up',
      rejection_followup: 'Rejection Follow-up'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedLog(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <EmailIcon sx={{ mr: 2 }} />
          Email Logs & Analytics
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Monitor automated email delivery and track communication with candidates
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Emails Sent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {stats.sent}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Successfully Delivered
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error.main">
                {stats.failed}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Failed to Send
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pending Delivery
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterIcon sx={{ mr: 1 }} />
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Email Type"
                value={filter.emailType}
                onChange={(e) => setFilter({ ...filter, emailType: e.target.value })}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="shortlisted">Interview Invitation</MenuItem>
                <MenuItem value="rejected">Rejection Notice</MenuItem>
                <MenuItem value="selected">Job Offer</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Show"
                value={filter.limit}
                onChange={(e) => setFilter({ ...filter, limit: e.target.value })}
              >
                <MenuItem value={25}>Last 25</MenuItem>
                <MenuItem value={50}>Last 50</MenuItem>
                <MenuItem value={100}>Last 100</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Email Logs Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Email Delivery History
          </Typography>

          {loading ? (
            <LinearProgress />
          ) : logs.length === 0 ? (
            <Alert severity="info">
              No email logs found matching the current filters.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Email Type</TableCell>
                    <TableCell>Recipient</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Sent At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(log.status)}
                          <Chip
                            label={log.status}
                            color={getStatusColor(log.status)}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getEmailTypeLabel(log.emailType)}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {log.recipient}
                        </Typography>
                        {log.candidateId?.name && (
                          <Typography variant="caption" color="textSecondary">
                            {log.candidateId.name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {log.subject}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(log.sentAt)}
                        </Typography>
                        {log.retryCount > 0 && (
                          <Typography variant="caption" color="warning.main">
                            Retries: {log.retryCount}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => handleViewDetails(log)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Email Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Email Details
        </DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    {getStatusIcon(selectedLog.status)}
                    <Chip
                      label={selectedLog.status}
                      color={getStatusColor(selectedLog.status)}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Email Type
                  </Typography>
                  <Chip
                    label={getEmailTypeLabel(selectedLog.emailType)}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Recipient
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {selectedLog.recipient}
                  </Typography>
                  {selectedLog.candidateId?.name && (
                    <Typography variant="body2" color="textSecondary">
                      {selectedLog.candidateId.name}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Sent At
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {formatDate(selectedLog.sentAt)}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Subject
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                  {selectedLog.subject}
                </Typography>
              </Box>

              {selectedLog.errorMessage && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2">Error Message:</Typography>
                  <Typography variant="body2">{selectedLog.errorMessage}</Typography>
                </Alert>
              )}

              {selectedLog.retryCount > 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    This email was retried {selectedLog.retryCount} time(s)
                  </Typography>
                </Alert>
              )}

              <Box>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                  Related Records
                </Typography>
                {selectedLog.applicationId && (
                  <Typography variant="body2">
                    Application ID: {selectedLog.applicationId}
                  </Typography>
                )}
                {selectedLog.jobId && (
                  <Typography variant="body2">
                    Job ID: {selectedLog.jobId}
                  </Typography>
                )}
                {selectedLog.candidateId && (
                  <Typography variant="body2">
                    Candidate ID: {selectedLog.candidateId._id || selectedLog.candidateId}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailLogs;