import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Work as WorkIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCandidate } from "../contexts/CandidateContext";
import axios from "axios";

const CandidateDashboard = () => {
  const [stats, setStats] = useState({
    profileCompleteness: 0,
    applicationsCount: 0,
    recommendedJobs: 0,
    skillsCount: 0,
  });
  const [recommendations, setRecommendations] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { candidate, getProfile } = useCandidate();
  const navigate = useNavigate();

  const loadDashboardData = useCallback(async () => {
    try {
      setError("");

      let profileData = candidate;
      if (!profileData) {
        try {
          const result = await getProfile();
          if (result.success) {
            profileData = result.candidate;
          } else {
            console.warn("Failed to load profile:", result.message);
          }
        } catch (profileError) {
          console.error("Error loading profile:", profileError);
          setError(
            "Failed to load profile data. Please try refreshing the page."
          );
        }
      }

      let recommendationsData = { recommendations: [] };
      try {
        const recommendationsRes = await axios.get(
          "http://localhost:5000/api/candidate/jobs/recommendations/for-me"
        );
        recommendationsData = recommendationsRes.data;
      } catch (recError) {
        console.error("Error loading recommendations:", recError);
        if (recError.response?.status === 401) {
          setError("Authentication failed. Please log in again.");
        }
      }

      let applicationsData = [];
      try {
        const applicationsRes = await axios.get(
          "http://localhost:5000/api/candidate/applications"
        );
        applicationsData = applicationsRes.data;
      } catch (appError) {
        console.error("Error loading applications:", appError);
        if (appError.response?.status === 401) {
          setError("Authentication failed. Please log in again.");
        }
      }

      const serverCompleteness = profileData?.profileCompleteness || 0;
      let clientCompleteness = 0;
      try {
        const {
          computeCompleteness,
        } = require("../utils/profileCompleteness2");
        clientCompleteness = computeCompleteness(profileData);
      } catch (e) {
        if (profileData) {
          let completed = 0;
          const total = 14;
          if (profileData.firstName && profileData.firstName.trim())
            completed++;
          if (profileData.lastName && profileData.lastName.trim()) completed++;
          if (profileData.email && profileData.email.trim()) completed++;
          if (profileData.phone && profileData.phone.trim()) completed++;
          if (profileData.currentTitle && profileData.currentTitle.trim())
            completed++;
          if (profileData.currentCompany && profileData.currentCompany.trim())
            completed++;
          if (
            profileData.yearsOfExperience !== undefined &&
            profileData.yearsOfExperience !== null
          )
            completed++;
          if (profileData.location?.city && profileData.location.city.trim())
            completed++;
          if (profileData.location?.state && profileData.location.state.trim())
            completed++;
          if (profileData.location?.remote !== undefined) completed++;
          if (
            profileData.skills &&
            Array.isArray(profileData.skills) &&
            profileData.skills.length > 0
          )
            completed++;
          if (
            profileData.resume &&
            (profileData.resume.filename || profileData.resume.originalName)
          )
            completed++;
          clientCompleteness = Math.min(
            100,
            Math.max(0, Math.round((completed / total) * 100))
          );
        }
      }

      const profileCompleteness = Math.max(
        serverCompleteness,
        clientCompleteness
      );

      setStats({
        profileCompleteness,
        applicationsCount: applicationsData.length,
        recommendedJobs: recommendationsData.recommendations.length,
        skillsCount: profileData?.skills?.length || 0,
      });

      setRecommendations(recommendationsData.recommendations.slice(0, 3));
      setRecentApplications(applicationsData.slice(0, 3));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(
        "Failed to load dashboard data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [candidate, getProfile]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {stats.profileCompleteness < 80 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Complete your profile</strong> - Add more details to get
            better job recommendations. Current completion:{" "}
            {stats.profileCompleteness}%
          </Typography>
          <Button
            size="small"
            variant="outlined"
            sx={{ ml: 2 }}
            onClick={() => navigate("/candidate/profile")}
          >
            Update Profile
          </Button>
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                <CircularProgress
                  variant="determinate"
                  value={stats.profileCompleteness}
                  size={60}
                  thickness={4}
                  sx={{
                    color: 'primary.main',
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.profileCompleteness}%
                  </Typography>
                </Box>
              </Box>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Profile Complete
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Profile strength
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Applications
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.applicationsCount}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Jobs applied to
                  </Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Recommendations
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.recommendedJobs}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Jobs for you
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Skills Listed
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.skillsCount}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Technical skills
                  </Typography>
                </Box>
                <WorkIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={() => navigate("/candidate/jobs")}
                >
                  Browse Jobs
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate("/candidate/profile")}
                >
                  Update Profile
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/candidate/applications")}
                >
                  View Applications
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Recommended for You
              </Typography>

              {recommendations.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {recommendations.map((job, index) => (
                    <Card key={job._id || index} variant="outlined" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/candidate/jobs/${job._id}`)}>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                              {job.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {job.company} • {job.location}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${job.matchScore}% Match`}
                            color={
                              job.matchScore >= 80
                                ? "success"
                                : job.matchScore >= 60
                                ? "warning"
                                : "default"
                            }
                            size="small"
                          />
                        </Box>

                        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                          {job.recommendationReason}
                        </Typography>

                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/candidate/jobs/${job._id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    variant="outlined"
                    onClick={() => navigate("/candidate/jobs")}
                  >
                    View All Recommendations
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  Complete your profile to get personalized job recommendations.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Recent Applications
              </Typography>

              {recentApplications.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {recentApplications.map((application, index) => {
                    const statusSteps = ['submitted', 'under_review', 'shortlisted', 'interviewed', 'offered'];
                    const currentStepIndex = statusSteps.indexOf(application.status);

                    return (
                      <Card key={application._id || index} variant="outlined">
                        <CardContent>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                                {application.job.title}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {application.job.company}
                              </Typography>
                            </Box>

                            <Chip
                              label={application.status.replace("_", " ")}
                              color={
                                application.status === "submitted"
                                  ? "default"
                                  : application.status === "under_review"
                                  ? "warning"
                                  : application.status === "shortlisted"
                                  ? "info"
                                  : application.status === "interviewed"
                                  ? "secondary"
                                  : application.status === "offered"
                                  ? "success"
                                  : "error"
                              }
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              {statusSteps.map((step, stepIndex) => (
                                <Box key={step} sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      backgroundColor: stepIndex <= currentStepIndex ? 'success.main' : 'grey.300',
                                      border: stepIndex === currentStepIndex ? '2px solid primary.main' : 'none'
                                    }}
                                  />
                                  {stepIndex < statusSteps.length - 1 && (
                                    <Box
                                      sx={{
                                        width: 20,
                                        height: 2,
                                        backgroundColor: stepIndex < currentStepIndex ? 'success.main' : 'grey.300',
                                        mx: 0.5
                                      }}
                                    />
                                  )}
                                </Box>
                              ))}
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              {statusSteps.map((step, stepIndex) => (
                                <Typography
                                  key={step}
                                  variant="caption"
                                  sx={{
                                    color: stepIndex <= currentStepIndex ? 'success.main' : 'text.secondary',
                                    fontSize: '0.7rem',
                                    textTransform: 'capitalize',
                                    fontWeight: stepIndex === currentStepIndex ? 'bold' : 'normal'
                                  }}
                                >
                                  {step.replace('_', ' ')}
                                </Typography>
                              ))}
                            </Box>
                          </Box>

                          <Typography variant="body2" color="textSecondary">
                            Applied {new Date(application.createdAt).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    );
                  })}

                  <Button
                    variant="outlined"
                    onClick={() => navigate("/candidate/applications")}
                  >
                    View All Applications
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  No applications yet. Start browsing jobs to find your next opportunity!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CandidateDashboard;
