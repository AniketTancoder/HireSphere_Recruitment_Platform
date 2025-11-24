import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  TestTube as TestTubeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useCandidate } from '../contexts/CandidateContext';
import notificationService from '../services/notificationService';

// Styled Components
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const CategoryHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const PreferenceRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const ChannelChips = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
}));

const NotificationPreferences = () => {
  const { user } = useAuth();
  const { candidate } = useCandidate();
  const isAdmin = user?.role === 'admin' || user?.role === 'recruiter';

  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedPanels, setExpandedPanels] = useState(['global']);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
      setMessage('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedPrefs = await notificationService.updatePreferences(preferences);
      setPreferences(updatedPrefs);
      setMessage('Preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      const defaultPrefs = await notificationService.resetPreferences();
      setPreferences(defaultPrefs);
      setMessage('Preferences reset to defaults!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error resetting preferences:', error);
      setMessage('Failed to reset preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.sendTestNotification();
      setMessage('Test notification sent!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error sending test notification:', error);
      setMessage('Failed to send test notification');
    }
  };

  const updatePreference = (path, value) => {
    setPreferences(prev => {
      const newPrefs = { ...prev };
      const keys = path.split('.');
      let current = newPrefs;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newPrefs;
    });
  };

  const handlePanelChange = (panel) => (event, isExpanded) => {
    setExpandedPanels(prev =>
      isExpanded
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  };

  const renderChannelSelector = (category, currentChannels) => {
    const availableChannels = ['in_app', 'email', 'push', 'sms'];
    const channelLabels = {
      in_app: 'In-App',
      email: 'Email',
      push: 'Push',
      sms: 'SMS'
    };

    return (
      <ChannelChips>
        {availableChannels.map(channel => (
          <Chip
            key={channel}
            label={channelLabels[channel]}
            size="small"
            color={currentChannels.includes(channel) ? 'primary' : 'default'}
            variant={currentChannels.includes(channel) ? 'filled' : 'outlined'}
            onClick={() => {
              const newChannels = currentChannels.includes(channel)
                ? currentChannels.filter(c => c !== channel)
                : [...currentChannels, channel];
              updatePreference(`categoryPreferences.${category}.channels`, newChannels);
            }}
          />
        ))}
      </ChannelChips>
    );
  };

  if (loading) {
    return (
      <PageContainer maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (!preferences) {
    return (
      <PageContainer maxWidth="md">
        <Alert severity="error">Failed to load notification preferences</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Notification Preferences
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize how and when you receive notifications to stay informed without being overwhelmed.
        </Typography>
      </Box>

      {message && (
        <Alert severity={message.includes('Failed') ? 'error' : 'success'} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {/* Global Settings */}
      <SectionPaper>
        <Accordion
          expanded={expandedPanels.includes('global')}
          onChange={handlePanelChange('global')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <CategoryHeader>
              <NotificationsIcon />
              <Typography variant="h6">Global Settings</Typography>
            </CategoryHeader>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.globalSettings.enabled}
                      onChange={(e) => updatePreference('globalSettings.enabled', e.target.checked)}
                    />
                  }
                  label="Enable notifications"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.globalSettings.quietHoursEnabled}
                      onChange={(e) => updatePreference('globalSettings.quietHoursEnabled', e.target.checked)}
                    />
                  }
                  label="Quiet hours"
                />
              </Grid>
              {preferences.globalSettings.quietHoursEnabled && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Quiet hours start"
                      type="time"
                      value={String(preferences.globalSettings.quietHoursStart).padStart(2, '0') + ':00'}
                      onChange={(e) => {
                        const hour = parseInt(e.target.value.split(':')[0]);
                        updatePreference('globalSettings.quietHoursStart', hour);
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Quiet hours end"
                      type="time"
                      value={String(preferences.globalSettings.quietHoursEnd).padStart(2, '0') + ':00'}
                      onChange={(e) => {
                        const hour = parseInt(e.target.value.split(':')[0]);
                        updatePreference('globalSettings.quietHoursEnd', hour);
                      }}
                      fullWidth
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.globalSettings.focusModeEnabled}
                      onChange={(e) => updatePreference('globalSettings.focusModeEnabled', e.target.checked)}
                    />
                  }
                  label="Focus mode (pause during work sessions)"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </SectionPaper>

      {/* Category Preferences */}
      <SectionPaper>
        <Typography variant="h6" gutterBottom>
          Category Preferences
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose which types of notifications you want to receive and through which channels.
        </Typography>

        {Object.entries(preferences.categoryPreferences).map(([category, prefs]) => (
          <Accordion
            key={category}
            expanded={expandedPanels.includes(category)}
            onChange={handlePanelChange(category)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                  {category} Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={prefs.enabled}
                      onChange={(e) => updatePreference(`categoryPreferences.${category}.enabled`, e.target.checked)}
                    />
                  }
                  label=""
                  sx={{ mr: 1 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {prefs.enabled && (
                <>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Delivery channels:
                  </Typography>
                  {renderChannelSelector(category, prefs.channels)}

                  <Box sx={{ mt: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Frequency</InputLabel>
                      <Select
                        value={prefs.frequency}
                        label="Frequency"
                        onChange={(e) => updatePreference(`categoryPreferences.${category}.frequency`, e.target.value)}
                      >
                        <MenuItem value="instant">Instant</MenuItem>
                        <MenuItem value="digest">Daily Digest</MenuItem>
                        <MenuItem value="weekly">Weekly Summary</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </SectionPaper>

      {/* Delivery Preferences */}
      <SectionPaper>
        <Accordion
          expanded={expandedPanels.includes('delivery')}
          onChange={handlePanelChange('delivery')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Delivery Preferences</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Email Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.deliveryPreferences.emailSettings.enabled}
                          onChange={(e) => updatePreference('deliveryPreferences.emailSettings.enabled', e.target.checked)}
                        />
                      }
                      label="Enable email notifications"
                    />
                  </Grid>
                  {preferences.deliveryPreferences.emailSettings.enabled && (
                    <>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Digest Time</InputLabel>
                          <Select
                            value={preferences.deliveryPreferences.emailSettings.digestTime}
                            label="Digest Time"
                            onChange={(e) => updatePreference('deliveryPreferences.emailSettings.digestTime', e.target.value)}
                          >
                            <MenuItem value="morning">Morning (9 AM)</MenuItem>
                            <MenuItem value="afternoon">Afternoon (2 PM)</MenuItem>
                            <MenuItem value="evening">Evening (6 PM)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Frequency</InputLabel>
                          <Select
                            value={preferences.deliveryPreferences.emailSettings.digestFrequency}
                            label="Frequency"
                            onChange={(e) => updatePreference('deliveryPreferences.emailSettings.digestFrequency', e.target.value)}
                          >
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Push Notification Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.deliveryPreferences.pushSettings.enabled}
                          onChange={(e) => updatePreference('deliveryPreferences.pushSettings.enabled', e.target.checked)}
                        />
                      }
                      label="Enable push notifications"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.deliveryPreferences.pushSettings.mobileOnly}
                          onChange={(e) => updatePreference('deliveryPreferences.pushSettings.mobileOnly', e.target.checked)}
                        />
                      }
                      label="Mobile only"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  SMS Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.deliveryPreferences.smsSettings.enabled}
                          onChange={(e) => updatePreference('deliveryPreferences.smsSettings.enabled', e.target.checked)}
                        />
                      }
                      label="Enable SMS notifications"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.deliveryPreferences.smsSettings.urgentOnly}
                          onChange={(e) => updatePreference('deliveryPreferences.smsSettings.urgentOnly', e.target.checked)}
                        />
                      }
                      label="Urgent notifications only"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </SectionPaper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            disabled={saving}
          >
            Reset to Defaults
          </Button>
        </Box>
        <Button
          variant="outlined"
          startIcon={<TestTubeIcon />}
          onClick={handleTestNotification}
          color="secondary"
        >
          Send Test Notification
        </Button>
      </Box>
    </PageContainer>
  );
};

export default NotificationPreferences;