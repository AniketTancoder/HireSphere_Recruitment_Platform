import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Link,
  Popper
} from '@mui/material';
import {
  DoneAll as DoneAllIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import NotificationItem from './NotificationItem';

// Styled Components
const DropdownContainer = styled(Popper)(({ theme }) => ({
  zIndex: 1300,
  marginTop: theme.spacing(1),
}));

const DropdownPaper = styled(Box)(({ theme }) => ({
  width: 380,
  maxHeight: 500,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[8],
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const Header = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
}));

const NotificationList = styled(Box)(({ theme }) => ({
  flex: 1,
  maxHeight: 350,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.action.hover,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.action.disabled,
    borderRadius: 3,
  },
}));

const Footer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  textAlign: 'center',
}));

const EmptyState = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const LoadMoreButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  minWidth: 120,
}));

const NotificationDropdown = ({
  anchorEl,
  open,
  onClose,
  notifications,
  unreadCount,
  loading,
  hasMore,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onLoadMore
}) => {
  const navigate = useNavigate();
  const listRef = useRef(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!open) return;

      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }

    // Navigate to related page based on notification type
    if (notification.data?.actionUrl) {
      navigate(notification.data.actionUrl);
    }

    onClose();
  };

  return (
    <DropdownContainer
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ]}
    >
      <DropdownPaper>
        {/* Header */}
        <Header>
          <Typography variant="h6" component="h2">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={onMarkAllAsRead}
              startIcon={<DoneAllIcon />}
              sx={{ minWidth: 'auto' }}
            >
              Mark all read
            </Button>
          )}
        </Header>

        {/* Notification List */}
        <NotificationList ref={listRef}>
          {notifications.length === 0 ? (
            <EmptyState>
              <Typography variant="body2">
                No notifications yet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                You're all caught up!
              </Typography>
            </EmptyState>
          ) : (
            notifications.map((notification, index) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
                onMarkAsRead={() => onMarkAsRead(notification._id)}
                onDelete={() => onDeleteNotification(notification._id)}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              />
            ))
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {hasMore && !loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
              <LoadMoreButton
                size="small"
                onClick={onLoadMore}
                variant="outlined"
              >
                Load More
              </LoadMoreButton>
            </Box>
          )}
        </NotificationList>

        {/* Footer */}
        <Footer>
          <Link
            component="button"
            variant="body2"
            onClick={handleViewAll}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            View All Notifications
            <ArrowForwardIcon fontSize="small" />
          </Link>
        </Footer>
      </DropdownPaper>
    </DropdownContainer>
  );
};

export default NotificationDropdown;