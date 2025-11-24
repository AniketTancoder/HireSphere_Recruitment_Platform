import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
  ViewModule as ViewModuleIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  GetApp as GetAppIcon,
  ContactMail as ContactMailIcon,
  Label as LabelIcon,
} from "@mui/icons-material";
import axios from "axios";

const CandidateCard = ({ candidate, onViewDetails, isSelected, onSelect }) => {
  if (!candidate) return null;
  // Handle different candidate data structures
  const firstName = candidate.firstName || candidate.name?.split(" ")[0] || "";
  const lastName =
    candidate.lastName || candidate.name?.split(" ").slice(1).join(" ") || "";
  const displayName = candidate.firstName
    ? `${candidate.firstName} ${candidate.lastName}`
    : candidate.name || "Unknown";

  return (
    <div>
      <Card
        sx={{
          height: "100%",
          cursor: "pointer",
          "&:hover": { boxShadow: 3, transform: "translateY(-2px)" },
          transition: "all 0.2s ease-in-out",
          border: isSelected ? "2px solid" : "1px solid #e0e0e0",
          borderColor: isSelected ? "primary.main" : "#e0e0e0",
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Box sx={{ mr: 1 }}>
              {isSelected ? (
                <CheckBoxIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(candidate._id);
                  }}
                  sx={{ cursor: "pointer", color: "primary.main" }}
                />
              ) : (
                <CheckBoxOutlineBlankIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(candidate._id);
                  }}
                  sx={{ cursor: "pointer" }}
                />
              )}
            </Box>
            <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
              {firstName?.[0]}
              {lastName?.[0] || firstName?.[1] || "?"}
            </Avatar>
            <Box>
              <Typography variant="h6">{displayName}</Typography>
              <Typography variant="body2" color="textSecondary">
                {candidate.currentTitle}{" "}
                {candidate.currentCompany && `at ${candidate.currentCompany}`}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <EmailIcon
                sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
              />
              <Typography variant="body2">{candidate.email}</Typography>
            </Box>
            {candidate.location?.city && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <LocationIcon
                  sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                />
                <Typography variant="body2">
                  {candidate.location.city}
                  {candidate.location.state
                    ? `, ${candidate.location.state}`
                    : ""}
                  {candidate.location.remote && " (Remote)"}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <WorkIcon sx={{ fontSize: 16, mr: 1, color: "text.secondary" }} />
              <Typography variant="body2">
                {candidate.experience || 0} years experience
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" sx={{ mb: 2, fontWeight: "bold" }}>
            Skills ({candidate.skills?.length || 0}):
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
            {(candidate.skills?.length > 0
              ? candidate.skills.slice(0, 4)
              : []
            ).map((skill, index) => (
              <Chip
                key={index}
                label={
                  skill.skill?.displayName ||
                  skill.skill?.name ||
                  (typeof skill === "string" ? skill : "Unknown Skill")
                }
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
            {candidate.skills?.length > 4 && (
              <Chip
                label={`+${candidate.skills.length - 4} more`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          {/* Match Score */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Match Score:
            </Typography>
            <Chip
              label={`${candidate.matchScore}%`}
              color={
                candidate.matchScore >= 80
                  ? "success"
                  : candidate.matchScore >= 60
                  ? "warning"
                  : "default"
              }
              size="small"
            />
          </Box>

          {/* Resume Info */}
          {candidate?.resume?.filename && (
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <DescriptionIcon
                sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
              />
              <Typography variant="body2" color="textSecondary">
                Resume:{" "}
                {candidate?.resume?.originalName || candidate?.resume?.filename}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="caption" color="textSecondary">
                Profile: {candidate.profileCompleteness || 0}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={candidate.profileCompleteness || 0}
                sx={{ width: 60, height: 4, mt: 0.5 }}
              />
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(candidate);
              }}
            >
              View Details
            </Button>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

const CandidateDatabase = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [searchParams, setSearchParams] = useState({
    search: "",
    skills: "",
    location: "",
    experience: "",
    page: 1,
    limit: 12,
    sort: "newest",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
  });
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      // For now, we'll get candidates from the existing admin API
      // In production, this would be a separate endpoint for portal candidates
      const response = await axios.get(
        `http://localhost:5000/api/candidates?${queryParams}`
      );
      setCandidates(response.data);
      setPagination({
        page: 1,
        total: response.data.length,
        pages: Math.ceil(response.data.length / searchParams.limit),
      });
    } catch (error) {
      console.error("Error loading candidates:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const handleSearchChange = (field, value) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (event, page) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setSearchParams({
      search: "",
      skills: "",
      location: "",
      experience: "",
      page: 1,
      limit: 12,
      sort: "newest",
    });
  };

  // Helper function to format experience display
  const formatExperienceDisplay = (experience) => {
    if (!experience) return "";
    if (experience.includes('-')) {
      const [min, max] = experience.split('-');
      if (max) {
        return `${min}-${max} years`;
      }
    }
    if (experience.includes('+')) {
      const min = experience.replace('+', '');
      return `${min}+ years`;
    }
    return `${experience} years`;
  };

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map((c) => c._id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedCandidates.length === 0) {
      alert("Please select candidates first");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/candidate-profiles/bulk-actions",
        {
          action,
          candidateIds: selectedCandidates,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (action === "export") {
        // Create CSV from the data
        const csvContent = convertToCSV(response.data.data);
        downloadCSV(csvContent, "candidates_export.csv");
      } else {
        alert(response.data.message);
      }

      setSelectedCandidates([]);
    } catch (error) {
      console.error("Bulk action error:", error);
      alert("Bulk action failed");
    }
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(","));

    // Add data rows
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header] || "";
        // Escape commas and quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialog(false);
    setSelectedCandidate(null);
  };

  const handleDownloadResume = async (candidateId, filename) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/candidate-profiles/${candidateId}/resume`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading resume:", error);
      alert("Failed to download resume");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              Candidate Database
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage and view all candidates from the job seeker portal
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant={viewMode === "grid" ? "contained" : "outlined"}
              startIcon={<ViewModuleIcon />}
              onClick={() => setViewMode("grid")}
              size="small"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "table" ? "contained" : "outlined"}
              startIcon={<TableChartIcon />}
              onClick={() => setViewMode("table")}
              size="small"
            >
              Table
            </Button>
          </Box>
        </Box>

        {/* Bulk Actions */}
        {selectedCandidates.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              p: 2,
              bgcolor: "action.selected",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2">
              {selectedCandidates.length} candidate
              {selectedCandidates.length > 1 ? "s" : ""} selected
            </Typography>
            <Button
              size="small"
              startIcon={<GetAppIcon />}
              onClick={() => handleBulkAction("export")}
            >
              Export
            </Button>
            <Button
              size="small"
              startIcon={<ContactMailIcon />}
              onClick={() => handleBulkAction("contact")}
            >
              Contact
            </Button>
            <Button
              size="small"
              startIcon={<LabelIcon />}
              onClick={() => handleBulkAction("tag")}
            >
              Tag
            </Button>
          </Box>
        )}
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SearchIcon sx={{ mr: 1 }} />
            Search & Filter Candidates
          </Typography>

          <Grid container spacing={3}>
            {/* Search Bar - Full width on mobile, larger on desktop */}
            <Grid item xs={12} lg={5}>
              <TextField
                fullWidth
                placeholder="Search by name, email, or title..."
                value={searchParams.search}
                onChange={(e) => handleSearchChange("search", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: { xs: 2, lg: 0 } }}
              />
            </Grid>

            {/* Filter Row 1 */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <TextField
                fullWidth
                placeholder="Skills (e.g., React, Python)"
                value={searchParams.skills}
                onChange={(e) => handleSearchChange("skills", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon sx={{ fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <TextField
                fullWidth
                placeholder="Location (city/state)"
                value={searchParams.location}
                onChange={(e) => handleSearchChange("location", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon sx={{ fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ minWidth: 'fit-content', mr: 1 }}>
                  Experience:
                </Typography>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <InputLabel>Min</InputLabel>
                  <Select
                    value={searchParams.experience?.split('-')[0] || ''}
                    onChange={(e) => {
                      const current = searchParams.experience || '';
                      const parts = current.split('-');
                      const newMin = e.target.value;
                      const newMax = parts[1] || '';
                      let newValue = '';
                      if (newMin && newMax) {
                        newValue = `${newMin}-${newMax}`;
                      } else if (newMin) {
                        newValue = `${newMin}+`;
                      } else if (newMax) {
                        newValue = `0-${newMax}`;
                      }
                      handleSearchChange("experience", newValue);
                    }}
                    label="Min"
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="0">0</MenuItem>
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                    <MenuItem value="3">3</MenuItem>
                    <MenuItem value="5">5</MenuItem>
                    <MenuItem value="7">7</MenuItem>
                    <MenuItem value="10">10</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="body2">-</Typography>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <InputLabel>Max</InputLabel>
                  <Select
                    value={searchParams.experience?.split('-')[1] || ''}
                    onChange={(e) => {
                      const current = searchParams.experience || '';
                      const parts = current.split('-');
                      const newMin = parts[0] || '';
                      const newMax = e.target.value;
                      let newValue = '';
                      if (newMin && newMax) {
                        newValue = `${newMin}-${newMax}`;
                      } else if (newMin) {
                        newValue = `${newMin}+`;
                      } else if (newMax) {
                        newValue = `0-${newMax}`;
                      }
                      handleSearchChange("experience", newValue);
                    }}
                    label="Max"
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                    <MenuItem value="3">3</MenuItem>
                    <MenuItem value="5">5</MenuItem>
                    <MenuItem value="7">7</MenuItem>
                    <MenuItem value="10">10</MenuItem>
                    <MenuItem value="15">15</MenuItem>
                    <MenuItem value="20">20+</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="body2" sx={{ ml: 1 }}>years</Typography>
              </Box>
            </Grid>

            {/* Filter Row 2 */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={searchParams.sort}
                  onChange={(e) => handleSearchChange("sort", e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="name">Name A-Z</MenuItem>
                  <MenuItem value="experience">Experience</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                sx={{
                  height: { xs: '48px', sm: '40px' },
                  borderColor: 'grey.400',
                  color: 'grey.600',
                  '&:hover': {
                    borderColor: 'grey.600',
                    backgroundColor: 'grey.50'
                  }
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>

          {/* Active Filters Display */}
          {(searchParams.search || searchParams.skills || searchParams.location || searchParams.experience) && (
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Active Filters:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {searchParams.search && (
                  <Chip
                    size="small"
                    label={`Search: "${searchParams.search}"`}
                    onDelete={() => handleSearchChange("search", "")}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {searchParams.skills && (
                  <Chip
                    size="small"
                    label={`Skills: ${searchParams.skills}`}
                    onDelete={() => handleSearchChange("skills", "")}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {searchParams.location && (
                  <Chip
                    size="small"
                    label={`Location: ${searchParams.location}`}
                    onDelete={() => handleSearchChange("location", "")}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {searchParams.experience && (
                  <Chip
                    size="small"
                    label={`Experience: ${formatExperienceDisplay(searchParams.experience)}`}
                    onDelete={() => handleSearchChange("experience", "")}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Results Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">
          {loading
            ? "Loading candidates..."
            : `${pagination.total} candidates found`}
        </Typography>
      </Box>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Candidates Display */}
      {!loading && (
        <>
          {viewMode === "grid" ? (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {candidates.map((candidate) => (
                <Grid item xs={12} md={6} lg={4} key={candidate._id}>
                  <div onClick={() => handleViewDetails(candidate)}>
                    <CandidateCard
                      candidate={candidate}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                </Grid>
              ))}
            </Grid>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <CheckBoxIcon
                        onClick={handleSelectAll}
                        sx={{
                          cursor: "pointer",
                          color:
                            selectedCandidates.length === candidates.length &&
                            candidates.length > 0
                              ? "primary.main"
                              : "action.disabled",
                        }}
                      />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Skills</TableCell>
                    <TableCell>Match Score</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Experience</TableCell>
                    <TableCell>Resume</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate._id} hover>
                      <TableCell padding="checkbox">
                        {selectedCandidates.includes(candidate._id) ? (
                          <CheckBoxIcon
                            onClick={() => handleSelectCandidate(candidate._id)}
                            sx={{ cursor: "pointer", color: "primary.main" }}
                          />
                        ) : (
                          <CheckBoxOutlineBlankIcon
                            onClick={() => handleSelectCandidate(candidate._id)}
                            sx={{ cursor: "pointer" }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {candidate.firstName} {candidate.lastName}
                      </TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {candidate.skills?.slice(0, 2).map((skill, index) => (
                            <Chip
                              key={index}
                              label={
                                skill?.skill?.displayName ||
                                skill?.skill?.name ||
                                skill?.name ||
                                "Unknown"
                              }
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {(candidate.skills?.length || 0) > 2 && (
                            <Typography variant="caption">
                              +{(candidate.skills?.length || 0) - 2} more
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${candidate.matchScore}%`}
                          color={
                            candidate.matchScore >= 80
                              ? "success"
                              : candidate.matchScore >= 60
                              ? "warning"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {candidate.location?.city
                          ? `${candidate.location.city}${
                              candidate.location.state
                                ? `, ${candidate.location.state}`
                                : ""
                            }`
                          : "Not specified"}
                      </TableCell>
                      <TableCell>
                        {candidate.experience || 0} years
                      </TableCell>
                      <TableCell>
                        {candidate?.resume?.filename ? (
                          <Button
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() =>
                              handleDownloadResume(
                                candidate._id,
                                candidate?.resume?.originalName ||
                                  candidate?.resume?.filename
                              )
                            }
                          >
                            Download
                          </Button>
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            No resume
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetails(candidate)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* No Results */}
          {candidates.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <PersonIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No candidates found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Try adjusting your search criteria or check back later for new
                candidate registrations.
              </Typography>
            </Box>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Candidate Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCandidate?.firstName
            ? `${selectedCandidate.firstName} ${selectedCandidate.lastName}`
            : selectedCandidate?.name || "Candidate Details"}
        </DialogTitle>
        <DialogContent
          sx={{
            maxHeight: "70vh",
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
          {selectedCandidate && (
            <Box>
              {/* Basic Info */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography>
                      <strong>Name:</strong>{" "}
                      {selectedCandidate.firstName
                        ? `${selectedCandidate.firstName} ${selectedCandidate.lastName}`
                        : selectedCandidate.name || "Not specified"}
                    </Typography>
                    <Typography>
                      <strong>Email:</strong> {selectedCandidate.email}
                    </Typography>
                    <Typography>
                      <strong>Phone:</strong>{" "}
                      {selectedCandidate.phone || "Not provided"}
                    </Typography>
                    <Typography>
                      <strong>Location:</strong>{" "}
                      {selectedCandidate.location?.city
                        ? `${selectedCandidate.location.city}${
                            selectedCandidate.location.state
                              ? `, ${selectedCandidate.location.state}`
                              : ""
                          }`.trim()
                        : "Not specified"}
                    </Typography>
                    <Typography>
                      <strong>Experience:</strong>{" "}
                      {selectedCandidate.experience || 0}{" "}
                      years
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Professional Info
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography>
                      <strong>Current Title:</strong>{" "}
                      {selectedCandidate.currentTitle || "Not specified"}
                    </Typography>
                    <Typography>
                      <strong>Current Company:</strong>{" "}
                      {selectedCandidate.currentCompany || "Not specified"}
                    </Typography>
                    <Typography>
                      <strong>Profile Completeness:</strong>{" "}
                      {selectedCandidate.profileCompleteness || 0}%
                    </Typography>
                    <Typography>
                      <strong>Last Active:</strong>{" "}
                      {selectedCandidate.lastActive
                        ? new Date(
                            selectedCandidate.lastActive
                          ).toLocaleDateString()
                        : "Not available"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Skills */}
              <Typography variant="h6" gutterBottom>
                Skills
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {selectedCandidate.skills?.length > 0 ? (
                  selectedCandidate.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={
                        typeof skill === "string"
                          ? skill
                          : `${
                              skill?.skill?.displayName ||
                              skill?.skill?.name ||
                              skill?.name ||
                              "Unknown"
                            } ${
                              skill?.proficiency ? `(${skill.proficiency})` : ""
                            }`.trim()
                      }
                      variant="outlined"
                      color="primary"
                    />
                  ))
                ) : (
                  <Typography color="textSecondary">
                    No skills listed
                  </Typography>
                )}
              </Box>

              {/* Resume */}
              {selectedCandidate?.resume?.filename && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Resume
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <DescriptionIcon />
                      <Box>
                        <Typography variant="body1">
                          {selectedCandidate?.resume?.originalName ||
                            selectedCandidate?.resume?.filename}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Uploaded:{" "}
                          {selectedCandidate?.resume?.uploadedAt
                            ? new Date(
                                selectedCandidate.resume.uploadedAt
                              ).toLocaleDateString()
                            : "Date not available"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}

              {/* Experience */}
              {selectedCandidate.experience &&
                selectedCandidate.experience.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Experience
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      {selectedCandidate.experience.map((exp, index) => (
                        <Box
                          key={index}
                          sx={{
                            mb: 2,
                            p: 2,
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold" }}
                          >
                            {exp.title} at {exp.company}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {exp.startDate
                              ? new Date(exp.startDate).toLocaleDateString()
                              : ""}{" "}
                            -{" "}
                            {exp.endDate
                              ? new Date(exp.endDate).toLocaleDateString()
                              : "Present"}
                          </Typography>
                          {exp.description && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {exp.description}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </>
                )}

              {/* Education */}
              {selectedCandidate.education &&
                selectedCandidate.education.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Education
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      {selectedCandidate.education.map((edu, index) => (
                        <Box
                          key={index}
                          sx={{
                            mb: 2,
                            p: 2,
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold" }}
                          >
                            {edu.degree} in {edu.fieldOfStudy}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {edu.institution} • {edu.graduationYear}
                          </Typography>
                          {edu.gpa && (
                            <Typography variant="body2">
                              GPA: {edu.gpa}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedCandidate?.resume?.filename && (
            <Button
              startIcon={<DownloadIcon />}
              onClick={() =>
                handleDownloadResume(
                  selectedCandidate._id,
                  selectedCandidate?.resume?.originalName ||
                    selectedCandidate?.resume?.filename
                )
              }
              variant="contained"
              color="primary"
            >
              Download Resume
            </Button>
          )}
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default CandidateDatabase;
