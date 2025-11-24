import { useState, useEffect } from 'react';
import axios from 'axios';
import MetricsService from '../services/MetricsService';

export const usePipelineMetrics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('http://localhost:5000/api/admin/analytics/pipeline-health');
      const healthData = response.data;

      validateConsistency(healthData);

      setData(healthData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching pipeline metrics:', err);
      setError(err.message || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  const validateConsistency = (healthData) => {
    if (!healthData || !healthData.metrics) return;

    const frontendCalculated = MetricsService.calculateAllMetrics({
      activeCandidates: healthData.metrics.activeCandidates || 0,
      openPositions: healthData.metrics.openPositions || 0,
      weeklyApplications: healthData.metrics.weeklyApplications || 0,
      avgDaysToFill: healthData.metrics.avgTimeToFill || 0,
      diverseCandidates: Math.round((healthData.metrics.diversityRatio / 100) * (healthData.metrics.activeCandidates || 1)),
      totalCandidates: healthData.metrics.activeCandidates || 0,
    });

    const inconsistencies = [];

    if (frontendCalculated.health.score !== healthData.healthScore) {
      inconsistencies.push(`Health Score: Frontend ${frontendCalculated.health.score} vs Backend ${healthData.healthScore}`);
    }

    if (frontendCalculated.health.status !== healthData.status) {
      inconsistencies.push(`Status: Frontend ${frontendCalculated.health.status} vs Backend ${healthData.status}`);
    }

    if (frontendCalculated.metrics.candidateVolume !== healthData.metrics.candidateVolumeHealth) {
      inconsistencies.push(`Candidate Volume: Frontend ${frontendCalculated.metrics.candidateVolume} vs Backend ${healthData.metrics.candidateVolumeHealth}`);
    }

    if (frontendCalculated.metrics.applicationRate !== healthData.metrics.applicationRateHealth) {
      inconsistencies.push(`Application Rate: Frontend ${frontendCalculated.metrics.applicationRate} vs Backend ${healthData.metrics.applicationRateHealth}`);
    }

    if (frontendCalculated.metrics.timeToFill !== healthData.metrics.timeToFillHealth) {
      inconsistencies.push(`Time to Fill: Frontend ${frontendCalculated.metrics.timeToFill} vs Backend ${healthData.metrics.timeToFillHealth}`);
    }

    if (frontendCalculated.metrics.diversityRatio !== (healthData.metrics.diversityHealth || healthData.metrics.diversityRatio)) {
      inconsistencies.push(`Diversity: Frontend ${frontendCalculated.metrics.diversityRatio} vs Backend ${healthData.metrics.diversityHealth || healthData.metrics.diversityRatio}`);
    }

    if (inconsistencies.length > 0) {
      console.warn('⚠️ METRICS INCONSISTENCY DETECTED:', inconsistencies);
    }
  };

  const refresh = async () => {
    await fetchMetrics();
  };

  const recalculate = async () => {
    try {
      await axios.post('http://localhost:5000/api/admin/analytics/calculate-health');
      await fetchMetrics();
    } catch (err) {
      console.error('Error recalculating metrics:', err);
      setError('Failed to recalculate metrics');
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,

    health: data ? {
      score: data.healthScore,
      status: data.status,
      color: MetricsService.getHealthStatus(data.healthScore).color,
      label: MetricsService.getHealthStatus(data.healthScore).label,
    } : null,

    metrics: data?.metrics ? {
      candidateVolume: data.metrics.candidateVolumeHealth || 0,
      applicationRate: data.metrics.applicationRateHealth || 0,
      timeToFill: data.metrics.timeToFillHealth || 0,
      diversityRatio: data.metrics.diversityHealth || data.metrics.diversityRatio || 0,
      activeCandidates: data.metrics.activeCandidates || 0,
      weeklyApplications: data.metrics.weeklyApplications || 0,
      openPositions: data.metrics.openPositions || 0,
      avgTimeToFill: data.metrics.avgTimeToFill || 0,
      candidateToJobRatio: data.metrics.candidateToJobRatio || 0,
    } : null,

    alerts: data?.alerts || [],
    recommendations: data?.recommendations || [],
    triggers: data?.triggers || [],

    refresh,
    recalculate,

    formatHealthScore: MetricsService.formatHealthScore,
    formatPercentage: MetricsService.formatPercentage,
    getHealthStatus: MetricsService.getHealthStatus,
  };
};

export default usePipelineMetrics;