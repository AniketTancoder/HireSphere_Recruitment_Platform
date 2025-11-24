import React, { useState, useEffect } from 'react';
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
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import jobService from '../services/jobService';
import SkillsSelector from '../components/SkillsSelector';

const AddJob = ({ editingJob, onJobCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    requiredSkills: [],
    niceToHaveSkills: [],
    experience: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [biasAnalysis, setBiasAnalysis] = useState(null);
  const [templates, setTemplates] = useState([]);
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  const navigate = useNavigate();

  // Load templates from localStorage (in a real app, this would be from the backend)
  useEffect(() => {
    try {
      const savedTemplates = localStorage.getItem('jobTemplates');
      if (savedTemplates) {
        const parsedTemplates = JSON.parse(savedTemplates);
        if (Array.isArray(parsedTemplates)) {
          setTemplates(parsedTemplates);
        }
      }
    } catch (error) {
      console.warn('Failed to load job templates from localStorage:', error);
      // Reset templates if corrupted
      localStorage.removeItem('jobTemplates');
    }
  }, []);

  // Initialize form data when editingJob changes
  useEffect(() => {
    if (editingJob) {
      console.log('Editing job data:', editingJob); // Debug log
      setFormData({
        title: editingJob.title || '',
        company: editingJob.company || '',
        description: editingJob.description || '',
        location: editingJob.location || '',
        salaryMin: editingJob.salaryMin || '',
        salaryMax: editingJob.salaryMax || '',
        requiredSkills: Array.isArray(editingJob.requiredSkills)
          ? editingJob.requiredSkills.map(skill => typeof skill === 'string' ? { id: skill, displayName: skill, name: skill } : skill)
          : [],
        niceToHaveSkills: Array.isArray(editingJob.niceToHaveSkills)
          ? editingJob.niceToHaveSkills.map(skill => typeof skill === 'string' ? { id: skill, displayName: skill, name: skill } : skill)
          : [],
        experience: editingJob.experience || editingJob.experienceRequired || '',
      });
    } else {
      // Reset to default when not editing
      setFormData({
        title: '',
        company: '',
        description: '',
        location: '',
        salaryMin: '',
        salaryMax: '',
        requiredSkills: [],
        niceToHaveSkills: [],
        experience: '',
      });
    }
  }, [editingJob]);

  // Save template
  const saveTemplate = () => {
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }

    setSavingTemplate(true);
    const newTemplate = {
      id: Date.now(),
      name: templateName,
      data: { ...formData }
    };

    try {
      const updatedTemplates = [...safeTemplates, newTemplate];
      setTemplates(updatedTemplates);
      localStorage.setItem('jobTemplates', JSON.stringify(updatedTemplates));
      setTemplateName('');
      setSavingTemplate(false);
      setError('');
    } catch (error) {
      console.error('Failed to save template:', error);
      setError('Failed to save template');
      setSavingTemplate(false);
    }
  };

  // Load template
  const loadTemplate = (template) => {
    setFormData({ ...template.data });
    setShowTemplates(false);
  };

  // Delete template
  const deleteTemplate = (templateId) => {
    try {
      const updatedTemplates = safeTemplates.filter(t => t.id !== templateId);
      setTemplates(updatedTemplates);
      localStorage.setItem('jobTemplates', JSON.stringify(updatedTemplates));
    } catch (error) {
      console.error('Failed to delete template:', error);
      // Reset templates if there's an issue
      setTemplates([]);
      localStorage.removeItem('jobTemplates');
    }
  };

  // Salary calculation function
  const calculateSuggestedSalary = () => {
    const baseSalaries = {
      'Software Engineer': { entry: 70000, mid: 95000, senior: 130000 },
      'Frontend Developer': { entry: 65000, mid: 85000, senior: 115000 },
      'Backend Developer': { entry: 70000, mid: 95000, senior: 130000 },
      'Full Stack Developer': { entry: 75000, mid: 100000, senior: 135000 },
      'DevOps Engineer': { entry: 80000, mid: 105000, senior: 140000 },
      'Data Scientist': { entry: 85000, mid: 115000, senior: 150000 },
      'Product Manager': { entry: 90000, mid: 120000, senior: 160000 },
      'Designer': { entry: 60000, mid: 80000, senior: 110000 },
      'QA Engineer': { entry: 55000, mid: 75000, senior: 100000 },
      'default': { entry: 50000, mid: 75000, senior: 100000 }
    };

    const experienceLevels = {
      '0-2': 'entry',
      '3-5': 'mid',
      '6-10': 'senior',
      '10+': 'senior'
    };

    const title = formData.title?.toLowerCase() || '';
    const experience = formData.experience || '3-5';

    let roleData = baseSalaries.default;
    for (const [role, salaries] of Object.entries(baseSalaries)) {
      if (title.includes(role.toLowerCase())) {
        roleData = salaries;
        break;
      }
    }

    const level = experienceLevels[experience] || 'mid';
    const baseSalary = roleData[level];

    // Location adjustment (simplified)
    const locationMultiplier = formData.location?.toLowerCase().includes('san francisco') ||
                              formData.location?.toLowerCase().includes('new york') ? 1.3 :
                              formData.location?.toLowerCase().includes('remote') ? 1.1 : 1.0;

    const adjustedSalary = Math.round(baseSalary * locationMultiplier);

    return {
      min: Math.round(adjustedSalary * 0.9),
      max: Math.round(adjustedSalary * 1.2)
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequiredSkillsChange = (skills) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: skills
    }));
  };

  const handleNiceSkillsChange = (skills) => {
    setFormData(prev => ({
      ...prev,
      niceToHaveSkills: skills
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate required fields
    if (!formData.title || !formData.description || !formData.company) {
      setError('Title, description, and company are required');
      setLoading(false);
      return;
    }

    // Validate description length
    if (formData.description.trim().length < 50) {
      setError('Job description must be at least 50 characters long');
      setLoading(false);
      return;
    }

    if (!Array.isArray(formData.requiredSkills) || formData.requiredSkills.length === 0) {
      setError('At least one required skill is needed');
      setLoading(false);
      return;
    }

    try {
      const jobData = {
        ...formData,
        requiredSkills: Array.isArray(formData.requiredSkills) ? formData.requiredSkills.map(skill => skill.name) : [],
        niceToHaveSkills: Array.isArray(formData.niceToHaveSkills) ? formData.niceToHaveSkills.map(skill => skill.name) : [],
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
        experience: formData.experience ? parseInt(formData.experience) : undefined,
      };

      const result = editingJob
        ? await jobService.updateJob(editingJob._id, jobData)
        : await jobService.createJob(jobData);

      if (result.success) {
        setSuccess(true);
        // Extract bias analysis from the response if available
        if (result.data.aiAnalysis) {
          setBiasAnalysis(result.data.aiAnalysis);
        }

        // Call callback if provided (for inline usage), otherwise navigate
        if (onJobCreated) {
          setTimeout(() => {
            onJobCreated();
          }, 2000); // Shorter delay for inline usage
        } else {
          setTimeout(() => {
            navigate('/jobs');
          }, 3000);
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container component="main" maxWidth="md">
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div>
            <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                {editingJob ? 'Job Updated Successfully!' : 'Job Posted Successfully!'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                "{formData.title}" has been {editingJob ? 'updated' : 'posted'} at {formData.company}.
              </Typography>

              {biasAnalysis && (
                <Box sx={{ mt: 3, textAlign: 'left' }}>
                  <Typography variant="h6" gutterBottom>
                    AI Bias Analysis:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Chip
                      label={`Bias Score: ${biasAnalysis.biasScore}%`}
                      color={biasAnalysis.biasScore > 80 ? 'error' : biasAnalysis.biasScore > 60 ? 'warning' : 'success'}
                    />
                    <Chip
                      label={biasAnalysis.inclusiveLanguage ? 'Inclusive Language' : 'Review Language'}
                      color={biasAnalysis.inclusiveLanguage ? 'success' : 'warning'}
                    />
                  </Box>
                  {Array.isArray(biasAnalysis.foundBiases) && biasAnalysis.foundBiases.length > 0 && (
                    <Typography variant="body2" color="textSecondary">
                      Found {biasAnalysis.foundBiases.length} potentially biased terms
                    </Typography>
                  )}
                </Box>
              )}

              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Redirecting to jobs page...
              </Typography>
            </Paper>
          </div>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 0 }}>
      <div>
        <Paper elevation={2} sx={{ borderRadius: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 0, borderRadius: 0 }}>{error}</Alert>}

          {/* Template Actions */}
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<FolderOpenIcon />}
                onClick={() => setShowTemplates(!showTemplates)}
                disabled={loading}
                size="small"
              >
                {showTemplates ? 'Hide Templates' : 'Load Template'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={() => setSavingTemplate(!savingTemplate)}
                disabled={loading || !formData.title}
                size="small"
              >
                Save as Template
              </Button>
            </Box>
          </Box>

          {/* Save Template Dialog */}
          {savingTemplate && (
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Save Job Template
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  placeholder="Enter template name..."
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  disabled={loading}
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={saveTemplate}
                  disabled={!templateName.trim() || loading}
                  size="small"
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSavingTemplate(false);
                    setTemplateName('');
                  }}
                  size="small"
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}

          {/* Templates List */}
          {showTemplates && (
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Job Templates
              </Typography>
              {safeTemplates.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No templates saved yet. Create a job and save it as a template to reuse.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {safeTemplates.map((template) => (
                    <Box
                      key={template.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{template.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {template.data.title} at {template.data.company}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => loadTemplate(template)}
                        >
                          Load
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Basic Job Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  Basic Job Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  required
                  fullWidth
                  id="title"
                  label="Job Title"
                  name="title"
                  autoComplete="off"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={loading}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  required
                  fullWidth
                  id="company"
                  label="Company"
                  name="company"
                  autoComplete="organization"
                  value={formData.company}
                  onChange={handleInputChange}
                  disabled={loading}
                  variant="outlined"
                />
              </Grid>

              {/* Job Description */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mt: 2 }}>
                  Job Description
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Write a compelling job description that highlights responsibilities, requirements, and company culture
                </Typography>

                {/* Quick Format Helpers */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const textarea = document.getElementById('description');
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = formData.description;
                      const before = text.substring(0, start);
                      const selected = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '**' + selected + '**' + after;
                      setFormData(prev => ({ ...prev, description: newText }));
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + 2, end + 2);
                      }, 0);
                    }}
                    disabled={loading}
                  >
                    **Bold**
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const textarea = document.getElementById('description');
                      const start = textarea.selectionStart;
                      const text = formData.description;
                      const before = text.substring(0, start);
                      const after = text.substring(start);
                      const newText = before + '\n• ' + after;
                      setFormData(prev => ({ ...prev, description: newText }));
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + 3, start + 3);
                      }, 0);
                    }}
                    disabled={loading}
                  >
                    • Bullet
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const textarea = document.getElementById('description');
                      const start = textarea.selectionStart;
                      const text = formData.description;
                      const before = text.substring(0, start);
                      const after = text.substring(start);
                      const newText = before + '\n\nResponsibilities:\n• \n\nRequirements:\n• \n\nBenefits:\n• ' + after;
                      setFormData(prev => ({ ...prev, description: newText }));
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + 20, start + 20);
                      }, 0);
                    }}
                    disabled={loading}
                  >
                    Template
                  </Button>
                </Box>

                <TextField
                  required
                  fullWidth
                  id="description"
                  label="Job Description"
                  name="description"
                  multiline
                  rows={10}
                  placeholder="Describe the role, responsibilities, requirements, and what makes this position exciting...

Example:
We are looking for a talented Software Engineer to join our growing team.

Responsibilities:
• Design and develop scalable web applications
• Collaborate with cross-functional teams
• Write clean, maintainable code

Requirements:
• 3+ years of experience with React and Node.js
• Strong problem-solving skills
• Experience with agile development

What we offer:
• Competitive salary and benefits
• Flexible work arrangements
• Professional development opportunities"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={loading}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                      fontSize: '14px',
                      lineHeight: 1.6,
                    }
                  }}
                  helperText={`${formData.description.length} characters ${formData.description.length < 100 ? '(minimum 100 characters recommended)' : formData.description.length > 5000 ? '(maximum 5000 characters)' : '(good length)'}`}
                  inputProps={{
                    maxLength: 5000
                  }}
                />

                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Tip: Use the formatting buttons above for quick formatting, or write naturally with line breaks for readability
                </Typography>
              </Grid>

              {/* Location and Experience */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mt: 2 }}>
                  Job Requirements
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="location"
                  label="Location"
                  name="location"
                  placeholder="e.g., New York, NY or Remote"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={loading}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="experience"
                  label="Years of Experience Required"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleInputChange}
                  disabled={loading}
                  variant="outlined"
                />
              </Grid>

              {/* Salary Range */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mt: 2 }}>
                  Salary Range
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Set a competitive salary range based on role, experience, and location
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="salaryMin"
                      label="Minimum Salary ($)"
                      name="salaryMin"
                      type="number"
                      value={formData.salaryMin}
                      onChange={handleInputChange}
                      disabled={loading}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="salaryMax"
                      label="Maximum Salary ($)"
                      name="salaryMax"
                      type="number"
                      value={formData.salaryMax}
                      onChange={handleInputChange}
                      disabled={loading}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Salary Calculator */}
                <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    💰 Salary Range Calculator
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Suggested range based on {formData.title || 'similar roles'}: ${calculateSuggestedSalary().min.toLocaleString()} - ${calculateSuggestedSalary().max.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const suggested = calculateSuggestedSalary();
                        setFormData(prev => ({
                          ...prev,
                          salaryMin: suggested.min,
                          salaryMax: suggested.max
                        }));
                      }}
                      disabled={!formData.title}
                    >
                      Use Suggested Range
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const suggested = calculateSuggestedSalary();
                        setFormData(prev => ({
                          ...prev,
                          salaryMin: Math.round(suggested.min * 0.9),
                          salaryMax: Math.round(suggested.max * 1.1)
                        }));
                      }}
                      disabled={!formData.title}
                    >
                      Competitive Range
                    </Button>
                  </Box>
                </Card>
              </Grid>

              {/* Required Skills */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mt: 2 }}>
                  Required Skills
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Card variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <SkillsSelector
                      selectedSkills={formData.requiredSkills || []}
                      onSkillsChange={handleRequiredSkillsChange}
                      placeholder="Search for required skills..."
                      maxSkills={15}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Nice-to-have Skills */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mt: 2 }}>
                  Nice-to-Have Skills
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Card variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <SkillsSelector
                      selectedSkills={formData.niceToHaveSkills || []}
                      onSkillsChange={handleNiceSkillsChange}
                      placeholder="Search for nice-to-have skills..."
                      maxSkills={10}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {loading && <LinearProgress sx={{ mt: 3, mb: 2 }} />}

            <Box sx={{ display: 'flex', gap: 2, mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ flex: 1, py: 1.5 }}
              >
                {loading ? (editingJob ? 'Updating Job...' : 'Posting Job...') : (editingJob ? 'Update Job' : 'Post Job')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={onCancel || (() => navigate('/jobs'))}
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </div>
    </Container>
  );
};

export default AddJob;
