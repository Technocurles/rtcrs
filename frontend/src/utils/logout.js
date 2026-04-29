export const logoutUser = (navigate) => {
  // CRITICAL FIX: Clear both sessionStorage (tab-specific) and localStorage
  // This ensures proper logout regardless of whether user logged in via sessionStorage or localStorage
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("userData");
  // Also clear socket-specific sessionStorage items for tab isolation
  sessionStorage.removeItem("socketUserId");
  sessionStorage.removeItem("tabSocketId");
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userData");
  navigate("/");
};
