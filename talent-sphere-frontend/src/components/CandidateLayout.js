import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useCandidate } from '../contexts/CandidateContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileCard from './ProfileCard';
import NotificationBell from './NotificationBell';

const drawerWidth = 280;

const CandidateLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileCardOpen, setProfileCardOpen] = useState(false);
  const { candidate: profile, candidateLogout } = useCandidate();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    candidateLogout();
    navigate('/candidate/login');
  };

  const handleProfileClick = () => {
    setProfileCardOpen(true);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/candidate/dashboard' },
    { text: 'Find Jobs', icon: <SearchIcon />, path: '/candidate/jobs' },
    { text: 'My Applications', icon: <AssignmentIcon />, path: '/candidate/applications' },
  ];

  const drawer = (
    <div style={{
      background: 'rgba(248, 250, 252, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(0, 0, 0, 0.08)',
      height: '100%',
      position: 'relative'
    }}>
      <Toolbar sx={{
        justifyContent: 'center',
        background: 'rgba(248, 250, 252, 0.6)',
        backdropFilter: 'blur(10px)'
      }}>
        <img
          src="/hiresphere.png"
          alt="HireSphere Logo"
          style={{
            width: '140px',
            height: '140px',
            objectFit: 'cover'
          }}
        />
      </Toolbar>
      <Box sx={{
        p: 2,
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        background: 'rgba(248, 250, 252, 0.6)',
        backdropFilter: 'blur(10px)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}>
            {profile?.firstName?.[0]}{profile?.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {profile?.firstName} {profile?.lastName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {profile?.currentTitle}
            </Typography>
          </Box>
        </Box>
      </Box>
      <List sx={{ p: 2 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                mb: 1,
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                background: isSelected
                  ? 'linear-gradient(135deg, #1976d2, #1565c0)'
                  : 'rgba(255, 255, 255, 0.12)',
                border: isSelected
                  ? '2px solid rgba(25, 118, 210, 0.4)'
                  : '1px solid rgba(0, 0, 0, 0.12)',
                boxShadow: isSelected
                  ? '0 4px 20px rgba(25, 118, 210, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                '&::before': isSelected ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 'inherit',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                  pointerEvents: 'none',
                } : {},
                '&:hover': {
                  background: isSelected
                    ? 'linear-gradient(135deg, #1565c0, #0d47a1)'
                    : 'rgba(255, 255, 255, 0.2)',
                  border: isSelected
                    ? '2px solid #1976d2'
                    : '1px solid rgba(0, 0, 0, 0.2)',
                  transform: 'translateY(-2px)',
                  boxShadow: isSelected
                    ? '0 12px 30px rgba(25, 118, 210, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    : '0 8px 25px rgba(0, 0, 0, 0.15)',
                  backdropFilter: 'blur(15px)',
                  cursor: 'pointer',
                },
                '& .MuiListItemIcon-root': {
                  color: isSelected ? '#ffffff' : 'rgba(0, 0, 0, 0.7)',
                  transition: 'color 0.3s ease',
                  filter: isSelected ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))' : 'none',
                },
                '& .MuiListItemText-primary': {
                  color: isSelected ? '#ffffff' : 'rgba(0, 0, 0, 0.8)',
                  fontWeight: isSelected ? 600 : 500,
                  transition: 'all 0.3s ease',
                  textShadow: isSelected ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none',
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <NotificationBell />
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {profile?.firstName?.[0]}{profile?.lastName?.[0]}
              </Avatar>
            </IconButton>
          </div>
          <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { handleClose(); handleProfileClick(); }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'rgba(248, 250, 252, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'rgba(248, 250, 252, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {children}
      </Box>

      {/* Profile Card Dialog */}
      <ProfileCard
        open={profileCardOpen}
        onClose={() => setProfileCardOpen(false)}
        user={profile}
        isAdmin={false}
        onEditProfile={() => navigate('/candidate/profile')}
      />
    </Box>
  );
};

export default CandidateLayout;