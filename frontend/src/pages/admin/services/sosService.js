
import axios from "axios";
import API from "../../../config/api";

const API_URL = `${API}/api`;

// Get token from localStorage (checks both admin and sub-admin tokens)
// CRITICAL FIX: Use sessionStorage for sub-admin tokens to prevent cross-tab pollution
const getAuthHeader = () => {
  // Check for adminToken first, then subAdminToken from sessionStorage (tab-specific)
  const token = localStorage.getItem("adminToken") || sessionStorage.getItem("subAdminToken") || localStorage.getItem("subAdminToken");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available
// CRITICAL FIX: Use sessionStorage for sub-admin tokens
axiosInstance.interceptors.request.use((config) => {
  // Check for adminToken first, then subAdminToken from sessionStorage
  const token = localStorage.getItem("adminToken") || sessionStorage.getItem("subAdminToken") || localStorage.getItem("subAdminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ======================
// Public SOS API (for citizens)
// ======================

// Create SOS Alert (public - no auth required)
export const createSOSAlert = async (sosData) => {
  try {
    const response = await axios.post(`${API_URL}/crime/sos`, sosData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else if (error.request) {
      throw { message: "Network error - please check if the server is running" };
    } else {
      throw { message: error.message || "Error creating SOS alert" };
    }
  }
};

// =======================
// Admin SOS APIs
// =====================

// Get all SOS Alerts (Super Admin)
export const getAllSOSAlerts = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/crime/sos/all`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error fetching SOS alerts" };
  }
};

// Get SOS Alerts by City (Sub Admin)
export const getSOSAlertsByCity = async (params = {}) => {
  try {
    // CRITICAL FIX: Use sessionStorage for tab-specific token
    const token = sessionStorage.getItem("subAdminToken") || localStorage.getItem("subAdminToken");
    if (!token) {
      throw new Error("No sub-admin token found");
    }
    
    const response = await axios.get(`${API_URL}/crime/sos/city`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error fetching SOS alerts" };
  }
};

// Get Single SOS Alert
export const getSOSAlertById = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/crime/sos/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error fetching SOS alert" };
  }
};

// Update SOS Alert Status
export const updateSOSAlertStatus = async (id, data) => {
  try {
    // CRITICAL FIX: Use sessionStorage for tab-specific token
    const token = sessionStorage.getItem("subAdminToken") || localStorage.getItem("adminToken") || localStorage.getItem("subAdminToken");
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    const response = await axios.put(
      `${API_URL}/crime/sos/${id}/status`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error updating SOS alert" };
  }
};

// Get SOS Statistics
export const getSOSStats = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/crime/sos/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error fetching SOS statistics" };
  }
};

// Get citizen's own SOS alerts
export const getMySOSAlerts = async () => {
  try {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) {
      return {
        success: false,
        alerts: [],
      };
    }

    try {
      const response = await axios.get(`${API_URL}/crime/sos/me/alerts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (primaryError) {
      const fallbackResponse = await axios.get(`${API_URL}/crime/sos/my-alerts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return fallbackResponse.data;
    }
  } catch (error) {
    return {
      success: false,
      alerts: [],
    };
  }
};

export default {
  createSOSAlert,
  getAllSOSAlerts,
  getSOSAlertsByCity,
  getSOSAlertById,
  updateSOSAlertStatus,
  getSOSStats,
  getMySOSAlerts,
};

