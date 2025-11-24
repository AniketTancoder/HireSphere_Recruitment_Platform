import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

class JobService {
  async getJobs() {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch jobs'
      };
    }
  }

  async createJob(jobData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/jobs`, jobData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create job'
      };
    }
  }

  async getJobById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch job'
      };
    }
  }

  async updateJob(id, jobData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/jobs/${id}`, jobData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update job'
      };
    }
  }

  async deleteJob(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/jobs/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete job'
      };
    }
  }

  async updateJob(id, jobData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/jobs/${id}`, jobData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update job'
      };
    }
  }

  async deleteJob(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/jobs/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete job'
      };
    }
  }

  async getJobMatches(jobId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}/matches`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get job matches'
      };
    }
  }

  async rediscoverCandidates(jobId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}/rediscover`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to rediscover candidates'
      };
    }
  }

  async searchSkills(query, category = null, limit = 20) {
    try {
      const params = new URLSearchParams({ q: query, limit });
      if (category) params.append('category', category);

      const response = await axios.get(`${API_BASE_URL}/candidate/jobs/skills/search?${params}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search skills'
      };
    }
  }

  async getPopularSkills(category = null, limit = 10) {
    try {
      const params = new URLSearchParams({ limit });
      if (category) params.append('category', category);

      const response = await axios.get(`${API_BASE_URL}/candidate/jobs/skills/popular?${params}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get popular skills'
      };
    }
  }
}

export default new JobService();