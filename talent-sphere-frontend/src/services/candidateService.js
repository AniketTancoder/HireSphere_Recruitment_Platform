import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

class CandidateService {
  async getCandidates() {
    try {
      const response = await axios.get(`${API_BASE_URL}/candidates`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch candidates'
      };
    }
  }

  async addCandidate(candidateData, resumeFile) {
    try {
      const formData = new FormData();

      Object.keys(candidateData).forEach(key => {
        if (candidateData[key] !== null && candidateData[key] !== undefined) {
          formData.append(key, candidateData[key]);
        }
      });

      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      const response = await axios.post(`${API_BASE_URL}/candidates`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add candidate'
      };
    }
  }

  async addCandidateProfile(candidateData, resumeFile) {
    try {
      const formData = new FormData();

      Object.keys(candidateData).forEach(key => {
        if (candidateData[key] !== null && candidateData[key] !== undefined) {
          if (typeof candidateData[key] === 'object') {
            formData.append(key, JSON.stringify(candidateData[key]));
          } else {
            formData.append(key, candidateData[key]);
          }
        }
      });

      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      const response = await axios.post(`${API_BASE_URL}/admin/candidate-profiles`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add candidate profile'
      };
    }
  }

  async updateCandidate(id, candidateData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/candidates/${id}`, candidateData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update candidate'
      };
    }
  }

  async deleteCandidate(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/candidates/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete candidate'
      };
    }
  }

  async analyzeCandidate(candidateId, jobId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/candidates/${candidateId}/analyze/${jobId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to analyze candidate'
      };
    }
  }

  async getCandidateById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/candidates/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch candidate'
      };
    }
  }

  async updateCandidate(id, candidateData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/candidates/${id}`, candidateData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update candidate'
      };
    }
  }

  async deleteCandidate(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/candidates/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete candidate'
      };
    }
  }
}

export default new CandidateService();