import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Checkbox,
  Button
} from '@mui/material';
import {
  Close as CloseIcon,
  Done as DoneIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  ThumbUp as ThumbUpIcon,
  Visibility as VisibilityIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  LocationOn as LocationOnIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';

// Animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Styled Components
const ItemContainer = styled(Box)(({ theme, isRead }) => ({
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  backgroundColor: isRead ? 'transparent' : theme.palette.action.hover,
  borderLeft: isRead ? 'none' : `3px solid ${theme.palette.primary.main}`,
  animation: `${slideIn} 0.3s ease-out`,
  animationFillMode: 'both',

  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    transform: 'translateX(2px)',
  },

  '&:last-child': {
    borderBottom: 'none',
  },
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1.5),
}));

const IconContainer = styled(Avatar)(({ theme, type }) => ({
  width: 32,
  height: 32,
  backgroundColor: getIconBackgroundColor(type, theme),
  color: getIconColor(type, theme),
  flexShrink: 0,
}));

const TextContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
}));

const TitleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
}));

const Title = styled(Typography)(({ theme, isRead }) => ({
  fontWeight: isRead ? 400 : 600,
  fontSize: '0.875rem',
  lineHeight: 1.2,
  color: theme.palette.text.primary,
}));

const Message = styled(Typography)(({ theme }) => ({
  fontSize: '0.8125rem',
  lineHeight: 1.4,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}));

const Timestamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.disabled,
  fontWeight: 400,
}));

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
}));

const PriorityChip = styled(Chip)(({ theme }) => ({
  height: 20,
  fontSize: '0.6875rem',
  fontWeight: 500,
}));

// Helper functions for icon styling
function getIconBackgroundColor(type, theme) {
  // Group by category for consistent coloring
  if (type.includes('application') || type.includes('milestone')) {
    return theme.palette.success.light;
  }
  if (type.includes('job') || type.includes('match') || type.includes('skill')) {
    return theme.palette.primary.light;
  }
  if (type.includes('profile') || type.includes('candidate') || type.includes('person')) {
    return theme.palette.info.light;
  }
  if (type.includes('interview') || type.includes('schedule') || type.includes('event')) {
    return theme.palette.warning.light;
  }
  if (type.includes('compliance') || type.includes('security') || type.includes('privacy')) {
    return theme.palette.error.light;
  }
  if (type.includes('team') || type.includes('collaborator') || type.includes('group')) {
    return theme.palette.secondary.light;
  }
  if (type.includes('market') || type.includes('trend') || type.includes('performance')) {
    return theme.palette.success.light;
  }
  if (type.includes('system') || type.includes('integration') || type.includes('platform')) {
    return theme.palette.grey[300];
  }
  return theme.palette.grey[300];
}

function getIconColor(type, theme) {
  // Group by category for consistent coloring
  if (type.includes('application') || type.includes('milestone')) {
    return theme.palette.success.main;
  }
  if (type.includes('job') || type.includes('match') || type.includes('skill')) {
    return theme.palette.primary.main;
  }
  if (type.includes('profile') || type.includes('candidate') || type.includes('person')) {
    return theme.palette.info.main;
  }
  if (type.includes('interview') || type.includes('schedule') || type.includes('event')) {
    return theme.palette.warning.main;
  }
  if (type.includes('compliance') || type.includes('security') || type.includes('privacy')) {
    return theme.palette.error.main;
  }
  if (type.includes('team') || type.includes('collaborator') || type.includes('group')) {
    return theme.palette.secondary.main;
  }
  if (type.includes('market') || type.includes('trend') || type.includes('performance')) {
    return theme.palette.success.main;
  }
  if (type.includes('system') || type.includes('integration') || type.includes('platform')) {
    return theme.palette.grey[600];
  }
  return theme.palette.grey[600];
}

function getNotificationIcon(type) {
  switch (type) {
    // Core types
    case 'new_application':
      return <AssignmentIcon fontSize="small" />;
    case 'application_status_update':
      return <CheckCircleIcon fontSize="small" />;
    case 'job_match':
    case 'new_job':
      return <WorkIcon fontSize="small" />;
    case 'profile_view':
      return <VisibilityIcon fontSize="small" />;
    case 'interview_scheduled':
      return <ScheduleIcon fontSize="small" />;
    case 'system':
      return <InfoIcon fontSize="small" />;

    // Smart Candidate Portal
    case 'incomplete_application_reminder':
      return <WarningIcon fontSize="small" />;
    case 'interview_preparation_alert':
      return <EventIcon fontSize="small" />;
    case 'deadline_warning':
      return <ErrorIcon fontSize="small" />;
    case 'similar_job_suggestion':
      return <TrendingUpIcon fontSize="small" />;
    case 'profile_completeness_nudge':
      return <PersonIcon fontSize="small" />;
    case 'recruiter_profile_view':
      return <VisibilityIcon fontSize="small" />;
    case 'skill_match_alert':
      return <StarIcon fontSize="small" />;
    case 'application_milestone':
      return <ThumbUpIcon fontSize="small" />;
    case 'market_trend_insight':
      return <TimelineIcon fontSize="small" />;
    case 'networking_suggestion':
      return <GroupIcon fontSize="small" />;
    case 'interview_conflict_detection':
      return <WarningIcon fontSize="small" />;
    case 'reference_request_reminder':
      return <EmailIcon fontSize="small" />;
    case 'document_expiry_alert':
      return <DescriptionIcon fontSize="small" />;
    case 'privacy_setting_update':
      return <SecurityIcon fontSize="small" />;
    case 'platform_feature_announcement':
      return <InfoIcon fontSize="small" />;

    // Advanced Admin Portal
    case 'pipeline_bottleneck_alert':
      return <WarningIcon fontSize="small" />;
    case 'candidate_drop_off_warning':
      return <TrendingUpIcon fontSize="small" />;
    case 'diversity_metric_alert':
      return <GroupIcon fontSize="small" />;
    case 'time_to_fill_exceedance':
      return <ScheduleIcon fontSize="small" />;
    case 'high_potential_candidate':
      return <StarIcon fontSize="small" />;
    case 'passive_candidate_rediscovery':
      return <PersonIcon fontSize="small" />;
    case 'candidate_engagement_drop':
      return <TrendingUpIcon fontSize="small" />;
    case 'duplicate_application_detection':
      return <WarningIcon fontSize="small" />;
    case 'reference_check_completion':
      return <CheckCircleIcon fontSize="small" />;
    case 'background_check_result':
      return <SecurityIcon fontSize="small" />;
    case 'job_posting_expiry_warning':
      return <WarningIcon fontSize="small" />;
    case 'interview_feedback_pending':
      return <AssignmentIcon fontSize="small" />;
    case 'offer_approval_request':
      return <CheckCircleIcon fontSize="small" />;
    case 'compliance_requirement_alert':
      return <SecurityIcon fontSize="small" />;
    case 'integration_failure_notification':
      return <ErrorIcon fontSize="small" />;
    case 'team_task_assignment':
      return <AssignmentIcon fontSize="small" />;
    case 'collaborator_comment':
      return <EmailIcon fontSize="small" />;
    case 'approval_workflow_request':
      return <CheckCircleIcon fontSize="small" />;
    case 'team_performance_metric':
      return <AssessmentIcon fontSize="small" />;
    case 'cross_team_candidate_share':
      return <GroupIcon fontSize="small" />;

    // Intelligent Triggers
    case 'predictive_acceptance_alert':
      return <TrendingUpIcon fontSize="small" />;
    case 'market_salary_alert':
      return <BusinessIcon fontSize="small" />;
    case 'competitor_job_posting':
      return <WorkIcon fontSize="small" />;
    case 'candidate_sentiment_analysis':
      return <PersonIcon fontSize="small" />;
    case 'team_capacity_warning':
      return <GroupIcon fontSize="small" />;
    case 'interview_no_show_reschedule':
      return <ScheduleIcon fontSize="small" />;
    case 'offer_expiry_reminder':
      return <WarningIcon fontSize="small" />;
    case 'onboarding_checklist_update':
      return <CheckCircleIcon fontSize="small" />;
    case 'compliance_deadline_reminder':
      return <SecurityIcon fontSize="small" />;
    case 'performance_review_scheduling':
      return <AssessmentIcon fontSize="small" />;

    // External Systems
    case 'calendar_conflict_alert':
      return <EventIcon fontSize="small" />;
    case 'email_communication_sync':
      return <EmailIcon fontSize="small" />;
    case 'hris_onboarding_update':
      return <PersonIcon fontSize="small" />;
    case 'background_check_status':
      return <SecurityIcon fontSize="small" />;
    case 'job_board_performance':
      return <BusinessIcon fontSize="small" />;

    // Compliance
    case 'eeo_reporting_reminder':
      return <AssessmentIcon fontSize="small" />;
    case 'right_to_work_expiry':
      return <SecurityIcon fontSize="small" />;
    case 'visa_status_update':
      return <LocationOnIcon fontSize="small" />;
    case 'data_privacy_consent_renewal':
      return <SecurityIcon fontSize="small" />;
    case 'regulatory_change_alert':
      return <WarningIcon fontSize="small" />;

    default:
      return <NotificationsIcon fontSize="small" />;
  }
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'urgent':
      return 'error';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    case 'low':
    default:
      return 'default';
  }
}

const NotificationItem = ({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
  showCheckbox = false,
  isSelected = false,
  onSelect,
  style = {}
}) => {
  const {
    type,
    title,
    message,
    shortMessage,
    priority,
    isRead,
    createdAt,
    actionButtons = []
  } = notification;

  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    onMarkAsRead();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <ItemContainer
      isRead={isRead}
      onClick={onClick}
      style={style}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${title}: ${message}`}
    >
      <ContentContainer>
        {showCheckbox && (
          <Checkbox
            checked={isSelected}
            onChange={handleCheckboxClick}
            sx={{ mr: 1, alignSelf: 'flex-start', mt: 0.5 }}
          />
        )}
        <IconContainer type={type}>
          {getNotificationIcon(type)}
        </IconContainer>

        <TextContainer>
          <TitleContainer>
            <Title isRead={isRead} variant="body2">
              {title}
            </Title>
            {priority !== 'medium' && (
              <PriorityChip
                label={priority}
                size="small"
                color={getPriorityColor(priority)}
                variant="outlined"
              />
            )}
          </TitleContainer>

          <Message variant="body2">
            {shortMessage || message}
          </Message>

          {actionButtons && actionButtons.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              {actionButtons.slice(0, 2).map((button, index) => (
                <Button
                  key={index}
                  size="small"
                  variant={button.type === 'primary' ? 'contained' : 'outlined'}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(button.url, '_blank');
                  }}
                  sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                >
                  {button.label}
                </Button>
              ))}
            </Box>
          )}

          <Timestamp variant="caption">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </Timestamp>
        </TextContainer>

        <ActionsContainer
          sx={{
            opacity: (theme) => theme.palette.mode === 'dark' ? 0.8 : undefined,
          }}
        >
          {!isRead && (
            <IconButton
              size="small"
              onClick={handleMarkAsRead}
              title="Mark as read"
              sx={{ padding: 0.5 }}
            >
              <DoneIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={handleDelete}
            title="Delete notification"
            sx={{ padding: 0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </ActionsContainer>
      </ContentContainer>
    </ItemContainer>
  );
};

export default NotificationItem;