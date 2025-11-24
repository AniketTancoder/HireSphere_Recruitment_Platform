import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  PersonAdd as PersonAddIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import candidateService from '../services/candidateService';

const AddCandidate = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    currentTitle: '',
    currentCompany: '',
    yearsOfExperience: '',
    location: {
      city: '',
      state: '',
      country: 'United States',
      remote: false
    },
    skills: [],
    education: [],
    experience: []
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [skillProficiency, setSkillProficiency] = useState('intermediate');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setResumeFile(file);
      setError('');
    }
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.find(s => s.skill.toLowerCase() === currentSkill.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, {
          skill: currentSkill.trim(),
          proficiency: skillProficiency,
          yearsOfExperience: 0
        }]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const result = await candidateService.addCandidateProfile(formData, resumeFile);

      if (result.success) {
        setSuccess(true);
        // Extract skills from the response if available
        if (result.data.candidate && result.data.candidate.skills) {
          setExtractedSkills(result.data.candidate.skills.map(s => s.skill));
        }
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/candidates');
        }, 2000);
      } else {
        setError(result.message);
      }

    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container component="main" maxWidth="md">
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                Candidate Added Successfully!
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {formData.firstName} {formData.lastName} has been added to your candidate database.
              </Typography>

              {extractedSkills.length > 0 ? (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    AI-Extracted Skills:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {extractedSkills.map((skill, index) => (
                      <Chip key={index} label={skill} color="primary" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              ) : resumeFile && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom color="warning.main">
                    Resume Uploaded
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Resume uploaded successfully. AI processing is currently disabled but the file has been saved.
                  </Typography>
                </Box>
              )}

              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Redirecting to candidates page...
              </Typography>
            </Paper>
          </motion.div>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonAddIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography component="h1" variant="h4" color="primary">
                Add New Candidate
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonAddIcon sx={{ mr: 1 }} />
                    Basic Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="phone"
                    label="Phone Number"
                    name="phone"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="password"
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    helperText="Minimum 6 characters"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="confirmPassword"
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Professional Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <WorkIcon sx={{ mr: 1 }} />
                    Professional Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="currentTitle"
                    label="Current Job Title"
                    name="currentTitle"
                    placeholder="e.g., Software Engineer"
                    value={formData.currentTitle}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="currentCompany"
                    label="Current Company"
                    name="currentCompany"
                    placeholder="e.g., Tech Corp Inc."
                    value={formData.currentCompany}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="yearsOfExperience"
                    label="Years of Experience"
                    name="yearsOfExperience"
                    type="number"
                    inputProps={{ min: 0, max: 50 }}
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </Grid>

                {/* Location */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <LocationIcon sx={{ mr: 1 }} />
                    Location
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    id="location.city"
                    label="City"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    id="location.state"
                    label="State/Province"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Open to Remote Work</InputLabel>
                    <Select
                      name="location.remote"
                      value={formData.location.remote.toString()}
                      onChange={(e) => handleInputChange({ target: { name: 'location.remote', value: e.target.value === 'true' } })}
                      disabled={loading}
                    >
                      <MenuItem value="false">No</MenuItem>
                      <MenuItem value="true">Yes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Skills */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Skills
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Add the candidate's technical and soft skills. You can also upload a resume to auto-extract skills.
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Enter a skill (e.g., JavaScript, React, Python)"
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      disabled={loading}
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Level</InputLabel>
                      <Select
                        value={skillProficiency}
                        onChange={(e) => setSkillProficiency(e.target.value)}
                        disabled={loading}
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
                      disabled={!currentSkill.trim() || loading}
                    >
                      Add
                    </Button>
                  </Box>

                  {formData.skills.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {formData.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={`${skill.skill} (${skill.proficiency})`}
                          onDelete={() => removeSkill(skill.skill)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}
                </Grid>

                {/* Resume Upload */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Resume Upload (Optional)
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Upload the candidate's resume (PDF or Word) and we'll automatically extract skills and experience.
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<CloudUploadIcon />}
                          disabled={loading}
                        >
                          Choose Resume
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                          />
                        </Button>
                        {resumeFile && (
                          <Typography variant="body2" color="primary">
                            {resumeFile.name}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {loading && <LinearProgress sx={{ mt: 3, mb: 2 }} />}

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  {loading ? 'Creating Profile...' : 'Create Profile'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/candidates')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default AddCandidate;