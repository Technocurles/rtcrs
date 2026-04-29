import axios from 'axios';

const citizenToken = () =>
  sessionStorage.getItem('token') || localStorage.getItem('token');

const citizenHeaders = () => ({
  headers: { Authorization: `Bearer ${citizenToken()}` },
});

// Get citizen's own reports
export const getMyReports = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/my-reports', citizenHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get citizen's crime stats
export const getMyCrimeStats = async () => {
  try {
    const response = await axios.get(
      'http://localhost:8080/api/crime/my-reports/stats',
      citizenHeaders()
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      stats: {
        totalReports: 0,
        pending: 0,
        under_review: 0,
        approved: 0,
        rejected: 0,
        closed: 0,
      },
    };
  }
};



// Get citizen's SOS count
export const getMySOSCount = async () => {
  try {
    const primaryResponse = await axios.get(
      'http://localhost:8080/api/crime/sos/me/count',
      citizenHeaders()
    );
    return primaryResponse.data;
  } catch (error) {
    try {
      const fallbackResponse = await axios.get(
        'http://localhost:8080/api/crime/sos/my-count',
        citizenHeaders()
      );
      return fallbackResponse.data;
    } catch (fallbackError) {
      return {
        success: false,
        sosCount: 0,
      };
    }
  }
};



