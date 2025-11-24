import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Chip,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import jobService from '../services/jobService';

const SkillsSelector = ({
  selectedSkills = [],
  onSkillsChange,
  placeholder = "Search for skills...",
  maxSkills = 20,
  showCategories = true,
  showPopular = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [popularSkills, setPopularSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [debounceTimer, setDebounceTimer] = useState(null);

  const skillCategories = [
    { value: null, label: 'All Skills' },
    { value: 'programming_languages', label: 'Programming Languages' },
    { value: 'frameworks_libraries', label: 'Frameworks & Libraries' },
    { value: 'databases', label: 'Databases' },
    { value: 'devops_cloud', label: 'DevOps & Cloud' },
    { value: 'tools_platforms', label: 'Tools & Platforms' },
    { value: 'soft_skills', label: 'Soft Skills' },
    { value: 'domain_expertise', label: 'Domain Expertise' },
    { value: 'design', label: 'Design' },
    { value: 'mobile', label: 'Mobile Development' },
    { value: 'data_science', label: 'Data Science' },
    { value: 'security', label: 'Security' },
    { value: 'testing', label: 'Testing' },
  ];

  // Load popular skills on mount
  useEffect(() => {
    if (showPopular) {
      loadPopularSkills();
    }
  }, [showPopular]);

  // Debounced search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        performSearch(searchQuery, skillCategories[activeTab]?.value);
      }, 300);
      setDebounceTimer(timer);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [searchQuery, activeTab]);

  const loadPopularSkills = async (category = null) => {
    try {
      const result = await jobService.getPopularSkills(category, 12);
      if (result.success) {
        setPopularSkills(result.data.skills);
      }
    } catch (error) {
      console.error('Failed to load popular skills:', error);
    }
  };

  const performSearch = async (query, category = null) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const result = await jobService.searchSkills(query, category, 15);
      if (result.success) {
        setSearchResults(result.data.skills);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (skill) => {
    if (!selectedSkills.some(s => s.id === skill.id) && selectedSkills.length < maxSkills) {
      onSkillsChange([...selectedSkills, skill]);
    }
  };

  const handleRemoveSkill = (skillId) => {
    onSkillsChange(selectedSkills.filter(s => s.id !== skillId));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (showPopular) {
      loadPopularSkills(skillCategories[newValue]?.value);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      programming_languages: '#1976d2',
      frameworks_libraries: '#388e3c',
      databases: '#f57c00',
      devops_cloud: '#7b1fa2',
      tools_platforms: '#d32f2f',
      soft_skills: '#0288d1',
      domain_expertise: '#689f38',
      design: '#9c27b0',
      mobile: '#ff5722',
      data_science: '#795548',
      security: '#607d8b',
      testing: '#8bc34a',
    };
    return colors[category] || '#757575';
  };

  return (
    <Box>
      {/* Selected Skills Display */}
      {selectedSkills.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Skills ({selectedSkills.length}/{maxSkills})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedSkills.map((skill) => (
              <Chip
                key={skill.id}
                label={skill.displayName}
                onDelete={() => handleRemoveSkill(skill.id)}
                sx={{
                  backgroundColor: getCategoryColor(skill.category),
                  color: 'white',
                  '& .MuiChip-deleteIcon': {
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      color: 'white',
                    },
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Search Input */}
      <TextField
        fullWidth
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
          endAdornment: loading && <CircularProgress size={20} />,
        }}
        sx={{ mb: 2 }}
      />

      {/* Category Tabs */}
      {showCategories && (
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          {skillCategories.map((category, index) => (
            <Tab
              key={category.value || 'all'}
              label={category.label}
              sx={{ minWidth: 'auto', px: 2 }}
            />
          ))}
        </Tabs>
      )}

      {/* Skills Display Area */}
      <Paper variant="outlined" sx={{ p: 2, minHeight: 200 }}>
        {searchQuery.length >= 2 ? (
          // Search Results
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Search Results
            </Typography>
            {searchResults.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {searchResults.map((skill) => (
                  <Chip
                    key={skill.id}
                    label={skill.displayName}
                    onClick={() => handleAddSkill(skill)}
                    variant="outlined"
                    color={selectedSkills.some(s => s.id === skill.id) ? 'primary' : 'default'}
                    disabled={selectedSkills.some(s => s.id === skill.id) || selectedSkills.length >= maxSkills}
                    icon={selectedSkills.some(s => s.id === skill.id) ? <StarIcon /> : undefined}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography color="textSecondary">
                {loading ? 'Searching...' : 'No skills found'}
              </Typography>
            )}
          </Box>
        ) : showPopular ? (
          // Popular Skills
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Popular Skills {skillCategories[activeTab]?.label !== 'All Skills' && `in ${skillCategories[activeTab]?.label}`}
            </Typography>
            {popularSkills.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {popularSkills.map((skill) => (
                  <Chip
                    key={skill.id}
                    label={skill.displayName}
                    onClick={() => handleAddSkill(skill)}
                    variant="outlined"
                    color={selectedSkills.some(s => s.id === skill.id) ? 'primary' : 'default'}
                    disabled={selectedSkills.some(s => s.id === skill.id) || selectedSkills.length >= maxSkills}
                    icon={selectedSkills.some(s => s.id === skill.id) ? <StarIcon /> : undefined}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography color="textSecondary">Loading popular skills...</Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary">
              Start typing to search for skills...
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Helper Text */}
      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
        Click on skills to add them. Maximum {maxSkills} skills allowed.
      </Typography>
    </Box>
  );
};

export default SkillsSelector;
