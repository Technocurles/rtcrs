import axios from "axios";
import API_BASE from "../../../config/api";

const API = `${API_BASE}/api/subadmins`;
const USER_API = `${API_BASE}/api`;
const ADMIN_API = `${API_BASE}/api/admin`;

// ======================
// Get Current Admin Info
// ======================

// Get current authenticated admin info from JWT token
// This is used to get the subadmin's city without relying on localStorage
// which is shared across browser tabs. Uses sessionStorage for tab-specific tokens.
export const getCurrentAdmin = async () => {
  try {
    // Try sessionStorage first (tab-specific), fall back to localStorage
    const token = sessionStorage.getItem("subAdminToken") || localStorage.getItem("subAdminToken");
    if (!token) {
      throw { message: "No authentication token found", status: 401 };
    }
    
    const response = await axios.get(`${ADMIN_API}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to get admin info", status: 500 };
  }
};

// Get auth header for sub-admin
// CRITICAL FIX: Use sessionStorage for tab-specific token
const getSubAdminAuthHeader = () => {
  const token = sessionStorage.getItem("subAdminToken") || localStorage.getItem("subAdminToken");
  if (!token) {
    throw { message: "No sub-admin token found", status: 401 };
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get auth header for super admin
const getSuperAdminAuthHeader = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    throw { message: "No admin token found", status: 401 };
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const getAllSubAdmins = async () => {
  const res = await axios.get(API);
  return res.data;
};

const deleteSubAdmin = async (id) => {
  return axios.delete(`${API}/${id}`);
};

const toggleStatus = async (id) => {
  return axios.patch(`${API}/${id}/status`);
};

// ======================
// User Management APIs
// ======================

// Get users by city (Sub Admin) - filters by their assigned city
export const getUsersByCity = async () => {
  try {
    const response = await axios.get(`${USER_API}/city`, getSubAdminAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch users", status: 500 };
  }
};

// Get all users (Super Admin only)
export const getAllUsers = async (params = {}) => {
  try {
    const response = await axios.get(`${USER_API}/all`, {
      ...getSuperAdminAuthHeader(),
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch users", status: 500 };
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${ADMIN_API}/stats`, getSuperAdminAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch dashboard stats" };
  }
};

export default {
  getAllSubAdmins,
  deleteSubAdmin,
  toggleStatus,
  getUsersByCity,
  getAllUsers,
  getDashboardStats,
};
