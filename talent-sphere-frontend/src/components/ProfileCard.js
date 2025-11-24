import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Divider,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";

const ProfileCard = ({
  open,
  onClose,
  user: initialUser,
  isAdmin = false,
  onEditProfile,
}) => {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && !isAdmin) {
      loadProfileData();
    } else if (open && isAdmin) {
      setUser(initialUser);
    }
  }, [open, isAdmin]);

  // Recalculate completeness when user data changes
  useEffect(() => {
    if (user) {
      // Force re-render by updating state if needed
      // The completeness is calculated in the render, so this ensures updates
    }
  }, [user]);

  const loadProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/candidate/profile"
      );
      setUser(response.data);
    } catch (error) {
      console.error("Failed to load profile:", error);
      setError("Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  if (loading) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogContent sx={{ p: 4, textAlign: "center", minHeight: 200 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Loading profile information...
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogContent sx={{ p: 4, textAlign: "center", minHeight: 200 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button onClick={loadProfileData} variant="outlined" sx={{ mt: 2 }}>
            Try Again
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogContent sx={{ p: 4, textAlign: "center", minHeight: 200 }}>
          <Typography variant="h6" color="textSecondary">
            No profile information available
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  // Compute completeness using shared helper based on register form fields
  // Admin completeness is still computed separately
  let completeness = 0;
  if (isAdmin) {
    let completed = 0;
    const total = 4;
    if (user.name && user.name.trim()) completed++;
    if (user.email && user.email.trim()) completed++;
    if (user.company && user.company.trim()) completed++;
    if (user.role && user.role.trim()) completed++;
    completeness = Math.round((completed / total) * 100);
  } else {
    // Lazy-load helper to avoid circular deps at module import time
    try {
      // eslint-disable-next-line global-require
      const { computeCompleteness } = require("../utils/profileCompleteness2");
      completeness = computeCompleteness(user);
    } catch (e) {
      // Fallback: basic heuristic
      let completed = 0;
      const total = 14;
      if (user.firstName && user.firstName.trim()) completed++;
      if (user.lastName && user.lastName.trim()) completed++;
      if (user.email && user.email.trim()) completed++;
      if (user.phone && user.phone.trim()) completed++;
      if (user.currentTitle && user.currentTitle.trim()) completed++;
      if (user.currentCompany && user.currentCompany.trim()) completed++;
      if (
        user.yearsOfExperience !== undefined &&
        user.yearsOfExperience !== null &&
        user.yearsOfExperience >= 0
      )
        completed++;
      if (user.location?.city && user.location.city.trim()) completed++;
      if (user.location?.state && user.location.state.trim()) completed++;
      if (user.location?.remote !== undefined) completed++;
      if (user.skills && Array.isArray(user.skills) && user.skills.length > 0)
        completed++;
      if (user.resume && (user.resume.filename || user.resume.originalName))
        completed++;
      completeness = Math.min(
        100,
        Math.max(0, Math.round((completed / total) * 100))
      );
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        {/* Header Background */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            height: 80,
            position: "relative",
          }}
        />
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 12,
            right: 16,
            color: "white",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent
          sx={{
            p: 0,
            maxHeight: "80vh",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "grey.100",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "grey.400",
              borderRadius: "3px",
              "&:hover": {
                backgroundColor: "grey.500",
              },
            },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ mx: 3, mt: -4, mb: 3, borderRadius: 3, boxShadow: 4 }}>
              <CardContent sx={{ p: 4 }}>
                {/* Profile Header */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mx: "auto",
                      mb: 2,
                      border: "4px solid white",
                      boxShadow: 3,
                      fontSize: "2.5rem",
                      bgcolor: "primary.main",
                    }}
                  >
                    {isAdmin
                      ? user.name?.charAt(0).toUpperCase()
                      : `${user.firstName?.[0]}${user.lastName?.[0]}`.toUpperCase()}
                  </Avatar>
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ fontWeight: "bold" }}
                  >
                    {isAdmin ? user.name : `${user.firstName} ${user.lastName}`}
                  </Typography>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    {isAdmin
                      ? `${user.role} at ${user.company}`
                      : user.currentTitle}
                  </Typography>
                  {!isAdmin && user.currentCompany && (
                    <Typography
                      variant="body1"
                      color="primary"
                      sx={{ fontWeight: "medium" }}
                    >
                      {user.currentCompany}
                    </Typography>
                  )}
                </Box>

                {/* Profile Completeness */}
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6">Profile Completeness</Typography>
                    <Chip
                      label={`${completeness}% Complete`}
                      color={
                        completeness >= 80
                          ? "success"
                          : completeness >= 60
                          ? "warning"
                          : "error"
                      }
                      size="small"
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={completeness}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "grey.200",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Profile Details */}
                <Grid container spacing={3}>
                  {/* Contact Information */}
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                      Contact Information
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <EmailIcon sx={{ mr: 2, color: "action.active" }} />
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Email
                          </Typography>
                          <Typography variant="body1">{user.email}</Typography>
                        </Box>
                      </Box>
                      {user.phone && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PhoneIcon sx={{ mr: 2, color: "action.active" }} />
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Phone
                            </Typography>
                            <Typography variant="body1">
                              {user.phone}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {/* Professional Information */}
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <WorkIcon sx={{ mr: 1, color: "primary.main" }} />
                      Professional Information
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {isAdmin ? (
                        <>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <BusinessIcon
                              sx={{ mr: 2, color: "action.active" }}
                            />
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                Company
                              </Typography>
                              <Typography variant="body1">
                                {user.company}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <WorkIcon sx={{ mr: 2, color: "action.active" }} />
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                Role
                              </Typography>
                              <Typography variant="body1">
                                {user.role}
                              </Typography>
                            </Box>
                          </Box>
                        </>
                      ) : (
                        <>
                          {user.yearsOfExperience !== undefined &&
                            user.yearsOfExperience !== null && (
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <WorkIcon
                                  sx={{ mr: 2, color: "action.active" }}
                                />
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    Years of Experience
                                  </Typography>
                                  <Typography variant="body1">
                                    {user.yearsOfExperience} years
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          {user.location && (
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <LocationIcon
                                sx={{ mr: 2, color: "action.active" }}
                              />
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  Location
                                </Typography>
                                <Typography variant="body1">
                                  {user.location.city}, {user.location.state}
                                  {user.location.remote && " (Open to Remote)"}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </>
                      )}
                    </Box>
                  </Grid>

                  {/* Skills Section (for candidates only) */}
                  {!isAdmin && (
                    <Grid item xs={12}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <WorkIcon sx={{ mr: 1, color: "primary.main" }} />
                        Skills{" "}
                        {user.skills && user.skills.length > 0
                          ? `(${user.skills.length})`
                          : ""}
                      </Typography>
                      {user.skills && user.skills.length > 0 ? (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {user.skills.map((skill, index) => {
                            // Handle different skill data structures
                            let skillName = "Unknown Skill";
                            let proficiency = "intermediate";

                            if (typeof skill === "string") {
                              skillName = skill;
                            } else if (skill && typeof skill === "object") {
                              // Handle populated skills from backend
                              if (
                                skill.skill &&
                                typeof skill.skill === "object"
                              ) {
                                skillName =
                                  skill.skill.name ||
                                  skill.skill.displayName ||
                                  "Unknown Skill";
                              } else if (
                                skill.skill &&
                                typeof skill.skill === "string"
                              ) {
                                skillName = skill.skill;
                              } else if (skill.name) {
                                skillName = skill.name;
                              } else if (skill.displayName) {
                                skillName = skill.displayName;
                              }

                              proficiency =
                                skill.proficiency ||
                                skill.level ||
                                "intermediate";
                            }

                            return (
                              <Chip
                                key={index}
                                label={`${skillName} (${proficiency})`}
                                variant="outlined"
                                color="primary"
                                size="small"
                              />
                            );
                          })}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No skills added yet
                        </Typography>
                      )}
                    </Grid>
                  )}

                  {/* Education Section (for candidates only) */}
                  {!isAdmin && user.education && user.education.length > 0 && (
                    <Grid item xs={12}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <SchoolIcon sx={{ mr: 1, color: "primary.main" }} />
                        Education
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {user.education.map((edu, index) => (
                          <Box
                            key={index}
                            sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}
                          >
                            <Typography variant="subtitle2">
                              {edu.degree}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {edu.institution} • {edu.fieldOfStudy}
                            </Typography>
                            {edu.graduationYear && (
                              <Typography variant="body2" color="textSecondary">
                                Graduated {edu.graduationYear}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{ borderRadius: 2 }}
                  >
                    Close
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default ProfileCard;
