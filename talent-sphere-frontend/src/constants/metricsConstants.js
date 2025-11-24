export const METRICS_CONFIG = {
  HEALTH_THRESHOLDS: {
    HEALTHY_MIN: 80,
    WARNING_MIN: 60,
    CRITICAL_MAX: 59,
  },

  WEIGHTS: {
    CANDIDATE_VOLUME: 0.4,
    APPLICATION_RATE: 0.3,
    TIME_TO_FILL: 0.2,
    DIVERSITY_RATIO: 0.1,
  },

  TARGETS: {
    CANDIDATES_PER_JOB: 10,
    WEEKLY_APPLICATIONS: 20,
    MAX_TIME_TO_FILL_DAYS: 30,
    MIN_DIVERSITY_RATIO: 0.2,
  },

  CRITICAL_THRESHOLDS: {
    CANDIDATES_PER_JOB: 5,
    WEEKLY_APPLICATIONS: 10,
    TIME_TO_FILL_DAYS: 60,
    DIVERSITY_RATIO: 0.1,
  },

  COLORS: {
    HEALTHY: '#00c851',
    WARNING: '#ffaa00',
    CRITICAL: '#ff4444',
    NEUTRAL: '#6c757d',
    SUCCESS: '#10b981',
    ERROR: '#ef4444',
  },

  STATUS_LABELS: {
    HEALTHY: 'Healthy',
    WARNING: 'Needs Attention',
    CRITICAL: 'Critical',
    UNKNOWN: 'Unknown',
  },

  ROUNDING: {
    PERCENTAGES: 0,
    SCORES: 0,
    RATIOS: 2,
  },

  CALCULATION_METHODS: {
    HEALTH_SCORE: (metrics) => {
      return (
        (metrics.candidateVolume * METRICS_CONFIG.WEIGHTS.CANDIDATE_VOLUME) +
        (metrics.applicationRate * METRICS_CONFIG.WEIGHTS.APPLICATION_RATE) +
        (metrics.timeToFill * METRICS_CONFIG.WEIGHTS.TIME_TO_FILL) +
        (metrics.diversityRatio * METRICS_CONFIG.WEIGHTS.DIVERSITY_RATIO)
      );
    },

    GET_STATUS: (score) => {
      if (score >= METRICS_CONFIG.HEALTH_THRESHOLDS.HEALTHY_MIN) return 'healthy';
      if (score >= METRICS_CONFIG.HEALTH_THRESHOLDS.WARNING_MIN) return 'warning';
      return 'critical';
    },

    GET_COLOR: (status) => {
      return METRICS_CONFIG.COLORS[status.toUpperCase()] || METRICS_CONFIG.COLORS.NEUTRAL;
    },

    GET_LABEL: (status) => {
      return METRICS_CONFIG.STATUS_LABELS[status.toUpperCase()] || METRICS_CONFIG.STATUS_LABELS.UNKNOWN;
    },
  },

  VALIDATION: {
    HEALTH_SCORE: {
      MIN: 0,
      MAX: 100,
    },
    PERCENTAGES: {
      MIN: 0,
      MAX: 100,
    },
    RATIOS: {
      MIN: 0,
      MAX: 10,
    },
  },

  DISPLAY_FORMATS: {
    HEALTH_SCORE: (score) => `${Math.round(score)}%`,
    PERCENTAGE: (value) => `${Math.round(value)}%`,
    RATIO: (value) => `${value.toFixed(METRICS_CONFIG.ROUNDING.RATIOS)}:1`,
    DAYS: (value) => `${Math.round(value)}d`,
  },
};

export const getHealthStatus = (score) => {
  return METRICS_CONFIG.CALCULATION_METHODS.GET_STATUS(score);
};

export const getHealthColor = (status) => {
  return METRICS_CONFIG.CALCULATION_METHODS.GET_COLOR(status);
};

export const getStatusLabel = (status) => {
  return METRICS_CONFIG.CALCULATION_METHODS.GET_LABEL(status);
};

export const formatHealthScore = (score) => {
  return METRICS_CONFIG.DISPLAY_FORMATS.HEALTH_SCORE(score);
};

export const formatPercentage = (value) => {
  return METRICS_CONFIG.DISPLAY_FORMATS.PERCENTAGE(value);
};

export const validateHealthScore = (score) => {
  return score >= METRICS_CONFIG.VALIDATION.HEALTH_SCORE.MIN &&
         score <= METRICS_CONFIG.VALIDATION.HEALTH_SCORE.MAX;
};

export const validatePercentage = (value) => {
  return value >= METRICS_CONFIG.VALIDATION.PERCENTAGES.MIN &&
         value <= METRICS_CONFIG.VALIDATION.PERCENTAGES.MAX;
};