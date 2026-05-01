import axios from "axios";
import API from "../../../config/api";

const API_URL = `${API}/api/crime`;

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

// Get sub-admin specific token
const getSubAdminAuthHeader = () => {
  // CRITICAL FIX: Use sessionStorage for tab-specific token
  const token = sessionStorage.getItem("subAdminToken") || localStorage.getItem("subAdminToken");
  if (!token) {
    throw new Error("No sub-admin token found");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get token from localStorage (for citizens)
const getCitizenAuthHeader = () => {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ======================
// ADMIN API CALLS
// ======================

// Get all crime reports (Super Admin)
export const getAllCrimeReports = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/all`, {
      ...getAuthHeader(),
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch reports" };
  }
};

// Get all unique cities (Super Admin)
export const getAllCities = async () => {
  try {
    const response = await axios.get(`${API_URL}/cities`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch cities" };
  }
};

// Get reports by city (Sub Admin)
export const getReportsByCity = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/city`, {
      ...getSubAdminAuthHeader(),
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch city reports" };
  }
};

// Get single report by ID
export const getCrimeReportById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch report" };
  }
};

// Update crime report status
export const updateCrimeStatus = async (id, statusData) => {
  try {
    const response = await axios.put(
      `${API_URL}/${id}/status`,
      statusData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update status" };
  }
};

// ======================
// CITIZEN API CALLS
// ======================

// Submit crime report with evidence
export const submitCrimeReport = async (formData) => {
  try {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/report`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to submit report" };
  }
};

// Get citizen's own reports
export const getMyReports = async () => {
  try {
    const response = await axios.get(`${API_URL}/my-reports`, getCitizenAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch your reports" };
  }
};

// Get single report by ID (citizen)
export const getMyReportById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/my-report/${id}`, getCitizenAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch report" };
  }
};

// ======================
// PUBLIC API CALLS (No Auth Required)
// ======================

// Get public crime reports for Home page map
export const getPublicCrimeReports = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/public`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch crime data" };
  }
};
