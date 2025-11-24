import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  List,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  DoneAll as DoneAllIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useCandidate } from '../contexts/CandidateContext';
import notificationService from '../services/notificationService';
import NotificationItem from '../components/NotificationItem';

// Styled Components
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const FiltersSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  alignItems: 'center',
  flexWrap: 'wrap',
}));

const AdvancedFiltersSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  alignItems: 'center',
  flexWrap: 'wrap',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
}));

const NotificationListContainer = styled(Paper)(({ theme }) => ({
  minHeight: 400,
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(8, 2),
  textAlign: 'center',
}));

const BulkActionsBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.action.selected,
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`notification-tabpanel-${index}`}
    aria-labelledby={`notification-tab-${index}`}
    {...other}
  >
    {value === index && children}
  </div>
);

const NotificationsPage = () => {
  const { user } = useAuth();
  const { candidate } = useCandidate();
  const isAdmin = user?.role === 'admin' || user?.role === 'recruiter';

  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Bulk actions
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [page, categoryFilter, typeFilter, priorityFilter, urgencyFilter, statusFilter, searchQuery, dateFrom, dateTo]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const filters = {
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(urgencyFilter !== 'all' && { urgency: urgencyFilter }),
        ...(statusFilter !== 'all' && { isRead: statusFilter === 'read' }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await notificationService.getFilteredNotifications(filters, page, 20);

      setNotifications(response.notifications);
      setTotalPages(response.pagination?.pages || 1);
      setTotalCount(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
    setSelectedNotifications([]);
    setSelectAll(false);

    // Reset all filters first
    setCategoryFilter('all');
    setTypeFilter('all');
    setPriorityFilter('all');
    setUrgencyFilter('all');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');

    // Apply tab-specific filters
    switch (newValue) {
      case 0: // All
        break;
      case 1: // Unread
        setStatusFilter('unread');
        break;
      case 2: // Applications
        setCategoryFilter('application');
        break;
      case 3: // System
        setCategoryFilter('system');
        break;
      default:
        break;
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleBulkMarkAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif =>
          selectedNotifications.includes(notif._id)
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setSelectedNotifications([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Error bulk marking as read:', error);
    }
  };

  const handleBulkDelete = async () => {
    setDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(
        selectedNotifications.map(id => notificationService.deleteNotification(id))
      );
      setNotifications(prev =>
        prev.filter(notif => !selectedNotifications.includes(notif._id))
      );
      setSelectedNotifications([]);
      setSelectAll(false);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error bulk deleting notifications:', error);
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n._id));
    }
    setSelectAll(!selectAll);
  };

  const getNotificationTypes = () => {
    if (isAdmin) {
      return [
        { value: 'all', label: 'All Types' },
        { value: 'new_application', label: 'New Applications' },
        { value: 'job_match', label: 'Job Matches' },
        { value: 'system', label: 'System' },
      ];
    } else {
      return [
        { value: 'all', label: 'All Types' },
        { value: 'application_update', label: 'Application Updates' },
        { value: 'job_match', label: 'Job Matches' },
        { value: 'profile_view', label: 'Profile Views' },
        { value: 'system', label: 'System' },
      ];
    }
  };

  const tabs = [
    { label: 'All', count: totalCount },
    { label: 'Unread', count: notifications.filter(n => !n.isRead).length },
    { label: 'Applications', count: notifications.filter(n => n.category === 'application').length },
    { label: 'System', count: notifications.filter(n => n.category === 'system').length },
  ];

  return (
    <PageContainer maxWidth="lg">
      <HeaderSection>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Notifications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Stay updated with the latest activity and important updates
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={loadNotifications}
          variant="outlined"
        >
          Refresh
        </Button>
      </HeaderSection>

      <FiltersSection>
        <TextField
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="application">Applications</MenuItem>
            <MenuItem value="interview">Interviews</MenuItem>
            <MenuItem value="profile">Profile</MenuItem>
            <MenuItem value="job">Jobs</MenuItem>
            <MenuItem value="system">System</MenuItem>
            <MenuItem value="compliance">Compliance</MenuItem>
            <MenuItem value="team">Team</MenuItem>
            <MenuItem value="market">Market</MenuItem>
            <MenuItem value="performance">Performance</MenuItem>
            <MenuItem value="integration">Integration</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            label="Type"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {getNotificationTypes().map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </FiltersSection>

      {/* Advanced Filters */}
      <AdvancedFiltersSection>
        <Typography variant="body2" sx={{ mr: 2, fontWeight: 500 }}>
          Advanced Filters:
        </Typography>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priorityFilter}
            label="Priority"
            onChange={(e) => setPriorityFilter(e.target.value)}
            size="small"
          >
            <MenuItem value="all">All Priorities</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Urgency</InputLabel>
          <Select
            value={urgencyFilter}
            label="Urgency"
            onChange={(e) => setUrgencyFilter(e.target.value)}
            size="small"
          >
            <MenuItem value="all">All Urgencies</MenuItem>
            <MenuItem value="immediate">Immediate</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="batch">Batch</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="unread">Unread</MenuItem>
            <MenuItem value="read">Read</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="From Date"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="To Date"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
      </AdvancedFiltersSection>

      <NotificationListContainer>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.label}
                  {tab.count > 0 && (
                    <Chip
                      label={tab.count}
                      size="small"
                      color={tab.count > 0 ? 'primary' : 'default'}
                    />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>

        {selectedNotifications.length > 0 && (
          <BulkActionsBar>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  indeterminate={
                    selectedNotifications.length > 0 &&
                    selectedNotifications.length < notifications.length
                  }
                />
              }
              label={`${selectedNotifications.length} selected`}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<DoneAllIcon />}
                onClick={handleBulkMarkAsRead}
                size="small"
              >
                Mark as Read
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                onClick={handleBulkDelete}
                size="small"
                color="error"
              >
                Delete
              </Button>
            </Box>
          </BulkActionsBar>
        )}

        <TabPanel value={activeTab} index={activeTab}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <EmptyState>
              <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No notifications found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'You\'re all caught up!'}
              </Typography>
            </EmptyState>
          ) : (
            <List>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onClick={() => {/* Handle navigation */}}
                  onMarkAsRead={() => handleMarkAsRead(notification._id)}
                  onDelete={() => handleDeleteNotification(notification._id)}
                  showCheckbox={selectedNotifications.length > 0}
                  isSelected={selectedNotifications.includes(notification._id)}
                  onSelect={() => handleSelectNotification(notification._id)}
                />
              ))}
            </List>
          )}
        </TabPanel>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </NotificationListContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Notifications</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedNotifications.length} notification(s)?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmBulkDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default NotificationsPage;