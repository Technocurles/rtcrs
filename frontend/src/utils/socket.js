


import { io } from "socket.io-client";

// Connect to backend socket server
const SOCKET_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// CRITICAL FIX: Use sessionStorage to track tab-specific socket
// Each tab has its own unique socket ID stored in sessionStorage
const getTabSocketId = () => {
  return sessionStorage.getItem("tabSocketId");
};

const setTabSocketId = (id) => {
  sessionStorage.setItem("tabSocketId", id);
};

// Get the current tab's user ID from sessionStorage
const getTabUserId = () => {
  return sessionStorage.getItem("socketUserId");
};

const setTabUserId = (userId) => {
  sessionStorage.setItem("socketUserId", userId);
};

let socket = null;

export const initializeSocket = (token, role, city = null, userId = null) => {
  // CRITICAL FIX: Get current tab's stored userId from sessionStorage
  const storedUserId = getTabUserId();
  
  // If we already have a socket with same userId in THIS tab, don't reconnect
  if (socket && socket.connected && storedUserId === userId) {
    return socket;
  }
  
  // Disconnect existing socket if user changed in THIS tab
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Store userId in sessionStorage for THIS tab only
  setTabUserId(userId);
  
  // Generate unique socket ID for this tab
  const tabSocketId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  setTabSocketId(tabSocketId);
  
  // Normalize the city before using it
  const normalizeCity = (cityName) => {
    if (!cityName) return null;
    return cityName.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };
  
  const normalizedCity = city ? normalizeCity(city) : null;
  
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
    // Add query params to help with connection tracking
    query: {
      role,
      city: normalizedCity || '',
      userId: userId || '',
      tabId: tabSocketId
    }
  });

  socket.on("connect", () => {
    // Join appropriate room based on role
    if (role === "super_admin") {
      socket.emit("joinSuperAdmin");
    }
  });

  socket.on("disconnect", () => {});

  socket.on("connect_error", () => {});

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initializeSocket first.");
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Listen for new crime reports (for admins)
export const onNewCrimeReport = (callback) => {
  if (socket) {
    socket.on("newCrimeReport", (data) => {
      callback(data);
    });
  }
};

// Listen for crime status updates (for citizens)
export const onCrimeStatusUpdate = (callback) => {
  if (socket) {
    socket.on("crimeStatusUpdate", (data) => {
      callback(data);
    });
  }
};

// Listen for new SOS alerts (for admins)
export const onNewSOSAlert = (callback) => {
  if (socket) {
    socket.on("newSOSAlert", (data) => {
      callback(data);
    });
  }
};

// Listen for SOS status updates (for citizens)
export const onSOSStatusUpdate = (callback) => {
  if (socket) {
    socket.on("sosStatusUpdate", (data) => {
      callback(data);
    });
  }
};

export const onStatsUpdate = (callback) => {
  if (socket) {
    socket.on("statsUpdate", (data) => {
      callback(data);
    });
  }
};

// Remove event listeners
export const removeCrimeReportListener = () => {
  if (socket) {
    socket.off("newCrimeReport");
  }
};

export const removeStatusUpdateListener = () => {
  if (socket) {
    socket.off("crimeStatusUpdate");
  }
};

export const removeSOSAlertListener = () => {
  if (socket) {
    socket.off("newSOSAlert");
  }
};

export const removeSOSStatusUpdateListener = () => {
  if (socket) {
    socket.off("sosStatusUpdate");
  }
};

export const removeStatsUpdateListener = () => {
  if (socket) {
    socket.off("statsUpdate");
  }
};
