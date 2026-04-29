const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

// Helper function to normalize city name for consistent room matching
// Uses Title Case: "surat" -> "Surat", "AHMEDABAD" -> "Ahmedabad"
const normalizeCity = (city) => {
  if (!city) return null;
  // Convert to lowercase first, then capitalize first letter of each word
  return city.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("A client connected:", socket.id, "User:", socket.user);

    // Join rooms based on role from JWT token
    if (socket.user.role === "super_admin") {
      socket.join("super_admin");
      console.log("Client joined super_admin room");
    } else if (socket.user.role === "sub_admin" && socket.user.city) {
      // Normalize city name for consistent room matching
      const normalizedCity = normalizeCity(socket.user.city);
      
      // Join sub-admin specific room for targeted SOS notifications ONLY
      // IMPORTANT: Do NOT join city_${city} room - that would allow ALL sub-admins in a city
      // to receive ALL SOS alerts for that city. Each sub-admin should only receive
      // SOS alerts explicitly assigned to them.
      socket.join(`subadmin_${socket.user.id}`);
      console.log(`Client (sub_admin) joined subadmin_${socket.user.id} room for targeted SOS alerts only`);
      console.log(`Socket ID: ${socket.id}, User ID: ${socket.user.id}, City: ${normalizedCity}`);
    } else if (socket.user.role === "citizen") {
      // Citizens join their own room for status updates
      socket.join(`user_${socket.user.id}`);
      console.log(`Client joined user_${socket.user.id} room`);
    }

    // Handle explicit room joining requests
    socket.on("joinSuperAdmin", () => {
      if (socket.user.role === "super_admin") {
        socket.join("super_admin");
      }
    });

    // DEPRECATED: Sub-admins should NOT join city rooms
    // They only receive SOS alerts via their unique subadmin_${id} room
    // This handler is kept for backward compatibility but does nothing
    socket.on("joinCityAdmin", (city) => {
      if (socket.user.role === "sub_admin" && city) {
        console.log(`joinCityAdmin called but IGNORED for sub_admin - they only receive targeted alerts via subadmin_${socket.user.id} room`);
        // Intentionally NOT joining city room to maintain strict SOS routing
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initializeSocket, getIO };
