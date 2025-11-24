import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useCandidate } from "../contexts/CandidateContext";
import axios from "axios";

const CandidateProfile = () => {
  const { profile, isAuthenticated, updateProfile } = useCandidate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({});
  const [newSkill, setNewSkill] = useState("");
  const [skillProficiency, setSkillProficiency] = useState("intermediate");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    skill: null,
  });
  const [experienceDialog, setExperienceDialog] = useState({
    open: false,
    experience: null,
    isEditing: false,
  });

  useEffect(() => {
    if (profile) {
      // Log full fetched profile for debugging/verification (includes populated skills)
      try {
        // Use structured logging to make inspection easy in browser console
        // eslint-disable-next-line no-console
        console.log('Fetched candidate profile:', profile);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Fetched candidate profile (string):', JSON.stringify(profile));
      }
      // Normalize skills so `skill` is always a string (displayName or name)
      const normalizedSkills = (profile.skills || []).map(s => {
        const proficiency = s.proficiency || 'intermediate';
        const yearsOfExperience = s.yearsOfExperience || 0;

        // s.skill may be a populated object or a string
        let skillName = '';
        if (!s) return null;
        if (typeof s.skill === 'string') {
          skillName = s.skill;
        } else if (s.skill && typeof s.skill === 'object') {
          skillName = s.skill.displayName || s.skill.name || '';
        }

        return {
          skill: skillName,
          proficiency,
          yearsOfExperience
        };
      }).filter(Boolean);

      setFormData({
        ...profile,
        skills: normalizedSkills,
        experience: profile.experience || []
      });
      setLoading(false);
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        experience: JSON.stringify(formData.experience || []),
        education: JSON.stringify(formData.education || []),
        skills: JSON.stringify(formData.skills || []),
        location: JSON.stringify(formData.location || {}),
        preferredJobTypes: JSON.stringify(formData.preferredJobTypes || []),
        preferredLocations: JSON.stringify(formData.preferredLocations || []),
        emailNotifications: JSON.stringify(formData.emailNotifications || {})
      };

      const response = await axios.put(
        "http://localhost:5000/api/candidate/profile",
        submitData
      );
      updateProfile(response.data);
      setSuccess("Profile updated successfully!");
      setEditMode(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Profile update error:", error);
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original profile data with normalized skills and experience
    const normalizedSkills = (profile.skills || []).map(s => {
      const proficiency = s.proficiency || 'intermediate';
      const yearsOfExperience = s.yearsOfExperience || 0;

      let skillName = '';
      if (typeof s.skill === 'string') {
        skillName = s.skill;
      } else if (s.skill && typeof s.skill === 'object') {
        skillName = s.skill.displayName || s.skill.name || '';
      }

      return {
        skill: skillName,
        proficiency,
        yearsOfExperience
      };
    }).filter(Boolean);

    setFormData({
      ...profile,
      skills: normalizedSkills,
      experience: profile.experience || []
    });
    setEditMode(false);
    setError("");
  };

  const addSkill = () => {
    if (
      newSkill.trim() &&
      !formData.skills?.find(
        (s) => s.skill.toLowerCase() === newSkill.toLowerCase()
      )
    ) {
      const skill = {
        skill: newSkill.trim(),
        proficiency: skillProficiency,
        yearsOfExperience: 0,
      };
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), skill],
      }));
      setNewSkill("");
    }
  };

  const handleDeleteSkill = (skillToDelete) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.skill !== skillToDelete),
    }));
    setDeleteDialog({ open: false, skill: null });
  };

  const handleAddExperience = () => {
    setExperienceDialog({
      open: true,
      experience: {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        achievements: []
      },
      isEditing: false,
    });
  };

  const handleEditExperience = (experience, index) => {
    setExperienceDialog({
      open: true,
      experience: { ...experience, index },
      isEditing: true,
    });
  };

  const handleDeleteExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleSaveExperience = (experienceData) => {
    setFormData((prev) => {
      const newExperience = [...(prev.experience || [])];
      if (experienceDialog.isEditing) {
        newExperience[experienceData.index] = {
          title: experienceData.title,
          company: experienceData.company,
          location: experienceData.location,
          startDate: experienceData.startDate,
          endDate: experienceData.current ? null : experienceData.endDate,
          current: experienceData.current,
          description: experienceData.description,
          achievements: experienceData.achievements || []
        };
      } else {
        newExperience.push({
          title: experienceData.title,
          company: experienceData.company,
          location: experienceData.location,
          startDate: experienceData.startDate,
          endDate: experienceData.current ? null : experienceData.endDate,
          current: experienceData.current,
          description: experienceData.description,
          achievements: experienceData.achievements || []
        });
      }
      return {
        ...prev,
        experience: newExperience,
      };
    });
    setExperienceDialog({ open: false, experience: null, isEditing: false });
  };

  const getProfileCompleteness = () => {
    if (!formData) return 0;

    // Profile completeness based on registration form fields (14 total)
    let completed = 0;
    const total = 14; // Total fields in registration form

    // Required fields (3 stored fields from registration)
    if (formData.firstName && formData.firstName.trim()) completed++; // 1. firstName
    if (formData.lastName && formData.lastName.trim()) completed++;   // 2. lastName
    if (formData.email && formData.email.trim()) completed++;         // 3. email
    // password and confirmPassword are not stored in profile

    // Optional fields (11 total from registration)
    if (formData.phone && formData.phone.trim()) completed++;         // 4. phone
    if (formData.currentTitle && formData.currentTitle.trim()) completed++; // 5. currentTitle
    if (formData.currentCompany && formData.currentCompany.trim()) completed++; // 6. currentCompany
    if (formData.yearsOfExperience !== undefined && formData.yearsOfExperience !== null && formData.yearsOfExperience >= 0) completed++; // 7. yearsOfExperience
    if (formData.location?.city && formData.location.city.trim()) completed++; // 8. location.city
    if (formData.location?.state && formData.location.state.trim()) completed++; // 9. location.state
    if (formData.location?.remote !== undefined) completed++; // 10. location.remote

    // Skills array (11)
    if (formData.skills && Array.isArray(formData.skills) && formData.skills.length > 0) {
      const validSkills = formData.skills.filter(skill =>
        skill && (skill.skill || skill.name || skill.displayName)
      );
      if (validSkills.length > 0) completed++;
    }

    // Resume file (12)
    if (formData.resume && (formData.resume.filename || formData.resume.originalName)) completed++;

    // Note: education and experience arrays are not part of registration form
    // They are added later in profile editing, so not counted in registration-based completeness

    return Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: "center" }}>
          Loading profile...
        </Typography>
      </Container>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Please log in to view your profile.</Alert>
      </Container>
    );
  }

  // Calculate real-time profile completeness based on actual filled fields
  const completeness = getProfileCompleteness();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4">My Profile</Typography>
          {!editMode ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
      </motion.div>

      <Grid container spacing={4}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mx: "auto",
                    mb: 2,
                    bgcolor: "primary.main",
                    fontSize: "2rem",
                  }}
                >
                  {formData.firstName?.[0]}
                  {formData.lastName?.[0]}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {formData.firstName} {formData.lastName}
                </Typography>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ mb: 1 }}
                >
                  {formData.currentTitle}{" "}
                  {formData.currentCompany && `at ${formData.currentCompany}`}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {formData.yearsOfExperience} years experience
                </Typography>
              </CardContent>
            </Card>

            {/* Profile Completeness */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile Completeness
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {completeness}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={completeness}
                    sx={{ flex: 1 }}
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Complete your profile to improve job matches
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Box
            sx={{
              maxHeight: "calc(100vh - 200px)",
              overflowY: "auto",
              pr: 1,
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Basic Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <PersonIcon sx={{ mr: 1 }} />
                    Basic Information
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formData.firstName || ""}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: (
                            <PersonIcon
                              sx={{ mr: 1, color: "action.active" }}
                            />
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName || ""}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: (
                            <EmailIcon sx={{ mr: 1, color: "action.active" }} />
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: (
                            <PhoneIcon sx={{ mr: 1, color: "action.active" }} />
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <WorkIcon sx={{ mr: 1 }} />
                    Professional Information
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Current Job Title"
                        name="currentTitle"
                        value={formData.currentTitle || ""}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Current Company"
                        name="currentCompany"
                        value={formData.currentCompany || ""}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Years of Experience"
                        name="yearsOfExperience"
                        type="number"
                        value={formData.yearsOfExperience || ""}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Location */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <LocationIcon sx={{ mr: 1 }} />
                    Location
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="City"
                        name="location.city"
                        value={formData.location?.city || ""}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="State/Province"
                        name="location.state"
                        value={formData.location?.state || ""}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth disabled={!editMode}>
                        <InputLabel>Open to Remote Work</InputLabel>
                        <Select
                          name="location.remote"
                          value={formData.location?.remote || false}
                          onChange={(e) =>
                            handleInputChange({
                              target: {
                                name: "location.remote",
                                value: e.target.value === "true",
                              },
                            })
                          }
                        >
                          <MenuItem value={false}>No</MenuItem>
                          <MenuItem value={true}>Yes</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Skills
                  </Typography>

                  {editMode && (
                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                      <TextField
                        fullWidth
                        placeholder="Add a skill (e.g., JavaScript, React, Python)"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addSkill()}
                        disabled={!editMode}
                      />
                      <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Level</InputLabel>
                        <Select
                          value={skillProficiency}
                          onChange={(e) => setSkillProficiency(e.target.value)}
                          disabled={!editMode}
                        >
                          <MenuItem value="beginner">Beginner</MenuItem>
                          <MenuItem value="intermediate">Intermediate</MenuItem>
                          <MenuItem value="advanced">Advanced</MenuItem>
                          <MenuItem value="expert">Expert</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        onClick={addSkill}
                        disabled={!newSkill.trim()}
                      >
                        Add
                      </Button>
                    </Box>
                  )}

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {formData.skills?.length > 0 ? (
                      formData.skills.map((skill, index) => {
                        // Handle different skill data structures
                        let skillName = "Unknown Skill";
                        let skillIdentifier = skill.skill;

                        if (typeof skill.skill === "string") {
                          skillName = skill.skill;
                        } else if (
                          skill.skill &&
                          typeof skill.skill === "object"
                        ) {
                          skillName =
                            skill.skill.name ||
                            skill.skill.displayName ||
                            "Unknown Skill";
                          skillIdentifier =
                            skill.skill.name ||
                            skill.skill.displayName ||
                            skill.skill._id;
                        }

                        return (
                          <Chip
                            key={index}
                            label={`${skillName} (${
                              skill.proficiency || "intermediate"
                            })`}
                            onDelete={
                              editMode
                                ? () =>
                                    setDeleteDialog({
                                      open: true,
                                      skill: skillIdentifier,
                                    })
                                : undefined
                            }
                            color="primary"
                            variant="outlined"
                          />
                        );
                      })
                    ) : (
                      <Typography color="textSecondary">
                        No skills added yet
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* Experience */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                      Work Experience
                    </Typography>
                    {editMode && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleAddExperience}
                      >
                        Add Experience
                      </Button>
                    )}
                  </Box>

                  {formData.experience?.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {formData.experience.map((exp, index) => (
                        <Box key={index} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {exp.title}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {exp.company} • {exp.location}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                              </Typography>
                            </Box>
                            {editMode && (
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                  size="small"
                                  onClick={() => handleEditExperience(exp, index)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteExperience(index)}
                                >
                                  Delete
                                </Button>
                              </Box>
                            )}
                          </Box>
                          {exp.description && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {exp.description}
                            </Typography>
                          )}
                          {exp.achievements && exp.achievements.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                Key Achievements:
                              </Typography>
                              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {exp.achievements.map((achievement, i) => (
                                  <li key={i}>
                                    <Typography variant="body2">{achievement}</Typography>
                                  </li>
                                ))}
                              </ul>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="textSecondary">
                      No work experience added yet
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Box>
        </Grid>
      </Grid>

      {/* Delete Skill Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, skill: null })}
      >
        <DialogTitle>Delete Skill</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove "{deleteDialog.skill}" from your
            skills?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, skill: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteSkill(deleteDialog.skill)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Experience Dialog */}
      <Dialog
        open={experienceDialog.open}
        onClose={() => setExperienceDialog({ open: false, experience: null, isEditing: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {experienceDialog.isEditing ? 'Edit Experience' : 'Add Experience'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Job Title"
                value={experienceDialog.experience?.title || ''}
                onChange={(e) => setExperienceDialog(prev => ({
                  ...prev,
                  experience: { ...prev.experience, title: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                value={experienceDialog.experience?.company || ''}
                onChange={(e) => setExperienceDialog(prev => ({
                  ...prev,
                  experience: { ...prev.experience, company: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={experienceDialog.experience?.location || ''}
                onChange={(e) => setExperienceDialog(prev => ({
                  ...prev,
                  experience: { ...prev.experience, location: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={experienceDialog.experience?.startDate ? new Date(experienceDialog.experience.startDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setExperienceDialog(prev => ({
                  ...prev,
                  experience: { ...prev.experience, startDate: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={experienceDialog.experience?.current || false}
                    onChange={(e) => setExperienceDialog(prev => ({
                      ...prev,
                      experience: { ...prev.experience, current: e.target.checked }
                    }))}
                  />
                }
                label="Current Position"
              />
            </Grid>
            {!experienceDialog.experience?.current && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={experienceDialog.experience?.endDate ? new Date(experienceDialog.experience.endDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setExperienceDialog(prev => ({
                    ...prev,
                    experience: { ...prev.experience, endDate: e.target.value }
                  }))}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={experienceDialog.experience?.description || ''}
                onChange={(e) => setExperienceDialog(prev => ({
                  ...prev,
                  experience: { ...prev.experience, description: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Key Achievements (one per line)"
                multiline
                rows={4}
                placeholder="Enter key achievements, one per line"
                value={experienceDialog.experience?.achievements?.join('\n') || ''}
                onChange={(e) => setExperienceDialog(prev => ({
                  ...prev,
                  experience: {
                    ...prev.experience,
                    achievements: e.target.value.split('\n').filter(a => a.trim())
                  }
                }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExperienceDialog({ open: false, experience: null, isEditing: false })}>
            Cancel
          </Button>
          <Button
            onClick={() => handleSaveExperience(experienceDialog.experience)}
            variant="contained"
            disabled={!experienceDialog.experience?.title || !experienceDialog.experience?.company}
          >
            {experienceDialog.isEditing ? 'Update' : 'Add'} Experience
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CandidateProfile;
