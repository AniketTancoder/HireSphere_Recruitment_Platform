import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const portalOptions = [
    {
      title: 'For Job Seekers',
      subtitle: 'Find your dream job with AI-powered matching',
      description: 'Create your profile, upload your resume, and get matched with the perfect opportunities.',
      icon: <PersonIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      buttonText: 'Get Started',
      buttonColor: 'primary',
      onClick: () => navigate('/candidate/login'),
      features: [
        'AI-powered resume parsing',
        'Personalized job recommendations',
        'Easy application tracking',
        'Skill-based matching'
      ]
    },
    {
      title: 'For Employers',
      subtitle: 'Find the perfect candidates for your team',
      description: 'Post jobs, review applications, and use intelligent matching to find top talent.',
      icon: <BusinessIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      buttonText: 'Admin Portal',
      buttonColor: 'secondary',
      onClick: () => navigate('/login'),
      features: [
        'Advanced candidate database',
        'AI bias detection',
        'Application workflow management',
        'Analytics and reporting'
      ]
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        {/* Logo Image */}
        <Box sx={{ mb: 4 }}>
          <img
            src="/hiresphere.png"
            alt="HireSphere Logo"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)'
            }}
          />
        </Box>

        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to HireSphere
        </Typography>
        <Typography variant="h5" color="textSecondary" sx={{ mb: 4 }}>
          The intelligent recruitment platform that connects great companies with exceptional talent
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 4 }}>
          <WorkIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <SearchIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
          <PersonIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        </Box>
      </Box>

      {/* Portal Selection */}
      <Grid container spacing={4} justifyContent="center">
        {portalOptions.map((option, index) => (
          <Grid item xs={12} sm={10} md={6} key={index}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={option.onClick}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ mb: 3 }}>
                  {option.icon}
                </Box>

                <Typography variant="h4" gutterBottom>
                  {option.title}
                </Typography>

                <Typography variant="h6" color="primary" gutterBottom>
                  {option.subtitle}
                </Typography>

                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                  {option.description}
                </Typography>

                {/* Features List */}
                <Box sx={{ mb: 4 }}>
                  {option.features.map((feature, idx) => (
                    <Typography key={idx} variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                      • {feature}
                    </Typography>
                  ))}
                </Box>

                <Button
                  variant="contained"
                  color={option.buttonColor}
                  size="large"
                  onClick={(e) => {
                    e.stopPropagation();
                    option.onClick();
                  }}
                >
                  {option.buttonText}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 8, pt: 4, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="textSecondary">
          © 2025 HireSphere. Connecting talent with opportunity through intelligent matching.
        </Typography>
      </Box>
    </Container>
  );
};

export default Landing;