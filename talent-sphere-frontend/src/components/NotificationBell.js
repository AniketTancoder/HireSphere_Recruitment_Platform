import React, { useState, useEffect, useRef } from 'react';
import { IconButton, Badge, Box, Grow, ClickAwayListener } from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import NotificationDropdown from './NotificationDropdown';
import notificationService from '../services/notificationService';

// Animations
const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  50% { transform: translateX(2px); }
  75% { transform: translateX(-1px); }
  100% { transform: translateX(0); }
`;

// Styled Components
const BellContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(1),
}));

const BellIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'hasNewNotification',
})(({ theme, hasNewNotification }) => ({
  position: 'relative',
  padding: theme.spacing(1),
  borderRadius: '50%',
  transition: 'all 0.2s ease-in-out',
  backgroundColor: 'transparent',
  color: '#ffffff',

  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'scale(1.05)',
  },

  '&:active': {
    transform: 'scale(0.95)',
  },

  ...(hasNewNotification && {
    animation: `${shake} 0.5s ease-in-out`,
  }),
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontSize: '9px',
    fontWeight: 'bold',
    minWidth: '16px',
    height: '16px',
    borderRadius: '50%',
    border: `1px solid ${theme.palette.background.paper}`,
    top: -2,
    right: -2,
  },
}));

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const bellRef = useRef(null);

  const open = Boolean(anchorEl);

  // Load initial notifications and unread count
  useEffect(() => {
    loadUnreadCount();
    loadNotifications();

    // Connect to real-time notifications
    const token = localStorage.getItem('token');
    if (token) {
      notificationService.connect(token);

      // Listen for new notifications
      notificationService.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        setHasNewNotification(true);

        // Reset animation after 3 seconds
        setTimeout(() => setHasNewNotification(false), 3000);
      });

      // Listen for notification updates
      notificationService.on('notification_updated', (data) => {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === data.notificationId
              ? { ...notif, isRead: data.isRead }
              : notif
          )
        );
        if (data.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      });
    }

    return () => {
      notificationService.disconnect();
    };
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadNotifications = async (loadMore = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const currentPage = loadMore ? page + 1 : 1;
      const response = await notificationService.getNotifications(currentPage, 15);

      if (loadMore) {
        setNotifications(prev => [...prev, ...response.notifications]);
        setPage(currentPage);
      } else {
        setNotifications(response.notifications);
        setPage(1);
      }

      setHasMore(response.notifications.length === 15);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setHasNewNotification(false);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <BellContainer ref={bellRef}>
        <BellIconButton
          onClick={handleClick}
          hasNewNotification={hasNewNotification}
          aria-label={`${unreadCount} unread notifications`}
          aria-expanded={open}
          aria-haspopup="true"
        >
          <NotificationBadge badgeContent={unreadCount} max={99}>
            {unreadCount > 0 ? (
              <NotificationsIcon sx={{ fontSize: 28 }} />
            ) : (
              <NotificationsNoneIcon sx={{ fontSize: 28 }} />
            )}
          </NotificationBadge>
        </BellIconButton>

        <Grow in={open} timeout={300}>
          <Box>
            <NotificationDropdown
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              notifications={notifications}
              unreadCount={unreadCount}
              loading={loading}
              hasMore={hasMore}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDeleteNotification={handleDeleteNotification}
              onLoadMore={() => loadNotifications(true)}
            />
          </Box>
        </Grow>
      </BellContainer>
    </ClickAwayListener>
  );
};

export default NotificationBell;