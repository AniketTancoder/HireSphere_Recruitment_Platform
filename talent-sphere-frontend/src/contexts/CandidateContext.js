import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const CandidateContext = createContext();

export const useCandidate = () => {
  return useContext(CandidateContext);
};

export const CandidateProvider = ({ children }) => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('candidateToken'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const loadCandidate = async () => {
      const storedToken = localStorage.getItem('candidateToken');
      const storedCandidate = localStorage.getItem('candidateData');

      if (storedToken && storedCandidate) {
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          const response = await axios.get('http://localhost:5000/api/candidate/profile');
          const candidateData = response.data;
          localStorage.setItem('candidateData', JSON.stringify(candidateData));
          setCandidate(candidateData);
        } catch (err) {
          setCandidate(JSON.parse(storedCandidate));
        }
      }
      setLoading(false);
    };

    loadCandidate();
  }, []);

  const candidateLogin = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/candidate/login', {
        email,
        password,
      });

      const { token: newToken, candidate: candidateData } = response.data;

      localStorage.setItem('candidateToken', newToken);
      localStorage.setItem('candidateData', JSON.stringify(candidateData));
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      try {
        const profileResp = await axios.get('http://localhost:5000/api/candidate/profile');
        const fullProfile = profileResp.data;
        localStorage.setItem('candidateData', JSON.stringify(fullProfile));
        setCandidate(fullProfile);
      } catch (err) {
        setCandidate(candidateData);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const candidateRegister = async (formData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/candidate/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { token: newToken, candidate: candidateData } = response.data;

      localStorage.setItem('candidateToken', newToken);
      localStorage.setItem('candidateData', JSON.stringify(candidateData));
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      try {
        const profileResp = await axios.get('http://localhost:5000/api/candidate/profile');
        const fullProfile = profileResp.data;
        localStorage.setItem('candidateData', JSON.stringify(fullProfile));
        setCandidate(fullProfile);
      } catch (err) {
        setCandidate(candidateData);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('http://localhost:5000/api/candidate/profile', profileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedCandidate = response.data.candidate;
      localStorage.setItem('candidateData', JSON.stringify(updatedCandidate));
      setCandidate(updatedCandidate);

      return { success: true, candidate: updatedCandidate };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  const getProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/candidate/profile');
      const candidateData = response.data;

      localStorage.setItem('candidateData', JSON.stringify(candidateData));
      setCandidate(candidateData);

      return { success: true, candidate: candidateData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load profile'
      };
    }
  };

  const candidateLogout = () => {
    localStorage.removeItem('candidateToken');
    localStorage.removeItem('candidateData');
    setToken(null);
    setCandidate(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    candidate,
    profile: candidate,
    token,
    loading,
    candidateLogin,
    candidateRegister,
    updateProfile,
    getProfile,
    candidateLogout,
    isAuthenticated: !!candidate
  };

  return (
    <CandidateContext.Provider value={value}>
      {children}
    </CandidateContext.Provider>
  );
};