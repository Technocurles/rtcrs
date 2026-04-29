const CrimeReport = require("../models/CrimeReport");
const cloudinary = require("../config/cloudinary");
const { isCloudinaryReady, getCloudinaryStatus } = require("../config/cloudinary");
const streamifier = require("streamifier");
const { getIO } = require("../config/socket");
const { getCrimeSeverity } = require("../utils/crimeSeverity");

/**
 * Upload file buffer to Cloudinary with timeout support
 */
const uploadToCloudinary = (fileBuffer, timeoutMs = 60000) => {
  // Check if Cloudinary is properly configured
  if (!isCloudinaryReady()) {
    const status = getCloudinaryStatus();
    console.error('Cloudinary upload error:', status.message);
    throw new Error('Cloudinary is not configured. File uploads are disabled. ' + status.message);
  }
  
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "crime_evidence",
        resource_type: "auto", // auto detect image/video/audio
        timeout: timeoutMs, // Cloudinary SDK timeout
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );

    // Set a fallback timeout in case Cloudinary SDK doesn't enforce it
    const timeoutId = setTimeout(() => {
      stream.destroy(new Error(`Upload timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    streamifier.createReadStream(fileBuffer).pipe(stream);
    
    // Clear timeout on successful completion
    stream.on('end', () => clearTimeout(timeoutId));
    stream.on('error', () => clearTimeout(timeoutId));
  });
};

/**
 * Create Crime Report
 */
const createCrimeReport = async (req, res) => {
  try {
    const {
      title,
      description,
      crimeType,
      dateOfCrime,
      approxTimeOfCrime,
      date,
      division,
      city,
      area,
      address,
      isAnonymous,
      location,
    } = req.body;

    // 🔹 Basic Validation (location is now optional)
    if (
      !title ||
      !description ||
      !crimeType ||
      !dateOfCrime ||
      !approxTimeOfCrime ||
      !division ||
      !city ||
      !area
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Location is now optional
    let parsedLocation = null;
    if (location) {
      // If location comes as string from frontend (FormData case)
      parsedLocation = typeof location === "string" ? JSON.parse(location) : location;

      // 🔹 Validate GeoJSON format
      if (
        parsedLocation.type !== "Point" ||
        !Array.isArray(parsedLocation.coordinates) ||
        parsedLocation.coordinates.length !== 2
      ) {
        return res.status(400).json({ message: "Invalid location format" });
      }
    }

    const files = req.files || [];

    // ENHANCED DEBUG: Log detailed file upload info
    console.log("========== FILE UPLOAD DEBUG ==========");
    console.log("Files received:", files.length);
    console.log("Files array:", files.map(f => ({ name: f.originalname, size: f.size, type: f.mimetype })));
    console.log("Content-Type header:", req.headers["content-type"]);
    console.log("req.body keys:", Object.keys(req.body));
    console.log("=======================================");

    // Fallback: Check if files might be in req.body.file (single file case)
    if (files.length === 0 && req.body.evidence) {
      console.log("WARNING: Files might be in req.body.evidence");
      console.log("req.body.evidence:", req.body.evidence);
    }

    if (files.length > 5) {
      return res.status(400).json({
        message: "Maximum 5 evidence files allowed",
      });
    }

    const evidence = [];

    for (const file of files) {
      console.log("Processing file:", file.originalname, file.mimetype, file.size);
      let fileType = "";

      // Handle files without mimetype - try to detect from extension
      if (!file.mimetype || file.mimetype === "") {
        const ext = file.originalname.split('.').pop().toLowerCase();
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
        const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
        const audioExts = ['mp3', 'wav', 'ogg', 'm4a'];
        
        if (imageExts.includes(ext)) {
          file.mimetype = "image/" + ext;
          fileType = "image";
        } else if (videoExts.includes(ext)) {
          file.mimetype = "video/" + ext;
          fileType = "video";
        } else if (audioExts.includes(ext)) {
          file.mimetype = "audio/" + ext;
          fileType = "audio";
        } else {
          return res.status(400).json({
            message: "Unsupported file type - could not detect from extension: " + file.originalname,
          });
        }
      }

      if (file.mimetype.startsWith("image")) {
        if (file.size > 5 * 1024 * 1024)
          return res.status(400).json({
            message: "Image size exceeds 5MB limit",
          });
        fileType = "image";
      } else if (file.mimetype.startsWith("video")) {
        if (file.size > 25 * 1024 * 1024)
          return res.status(400).json({
            message: "Video size exceeds 25MB limit",
          });
        fileType = "video";
      } else if (file.mimetype.startsWith("audio")) {
        if (file.size > 10 * 1024 * 1024)
          return res.status(400).json({
            message: "Audio size exceeds 10MB limit",
          });
        fileType = "audio";
      } else {
        return res.status(400).json({
          message: "Unsupported file type uploaded",

        });
      }

      // 🔥 Upload to Cloudinary
      const result = await uploadToCloudinary(file.buffer);

      evidence.push({
        fileUrl: result.secure_url,
        fileType,
        fileSize: file.size,
      });
    }

    // Calculate priority based on crime type
    const priority = getCrimeSeverity(crimeType);

    // Get user info for reporter snapshot (only if not anonymous)
    // Handle isAnonymous - can be boolean or string "true"/"false" from FormData
    const isAnon = isAnonymous === true || isAnonymous === "true";
    
    let reporterInfo = null;
    if (!isAnon) {
      const User = require("../models/User");
      const user = await User.findById(req.user.id).select("firstName lastName email mobile address");
      if (user) {
        reporterInfo = {
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          phone: user.mobile,
          city: user.address?.city || "",
        };
      }
    } else {
      // For anonymous reports, set minimal reporter info
      reporterInfo = {
        name: "Anonymous Reporter",
        email: "",
        phone: "",
        city: "",
      };
    }

    const crimeReport = await CrimeReport.create({
      reportedBy: req.user.id,
      reporterInfo,
      title,
      description,
      crimeType,
      dateOfCrime: new Date(dateOfCrime),
      approxTimeOfCrime,
      date: date ? new Date(date) : null,
      division,
      city,
      area,
      address,
      isAnonymous: isAnonymous || false,
      location: parsedLocation,
      evidence,
      status: "pending",
      priority: priority,
    });

    // Populate reporter info for notification
    await crimeReport.populate("reportedBy", "name email phone");

    // REAL-TIME NOTIFICATION: Emit to Super Admin and City-level Sub Admin
    try {
      const io = getIO();
      
      if (io) {
        // Notify Super Admin (all reports)
        io.to("super_admin").emit("newCrimeReport", {
          type: "NEW_CRIME_REPORT",
          data: {
            _id: crimeReport._id,
            reportId: crimeReport.reportId,
            title: crimeReport.title,
            description: crimeReport.description,
            crimeType: crimeReport.crimeType,
            city: crimeReport.city,
            area: crimeReport.area,
            address: crimeReport.address,
            status: crimeReport.status,
            priority: crimeReport.priority,
            location: crimeReport.location,
            dateOfCrime: crimeReport.dateOfCrime,
            approxTimeOfCrime: crimeReport.approxTimeOfCrime,
            createdAt: crimeReport.createdAt,
            evidence: crimeReport.evidence,
          },
          message: "New Crime Report: " + crimeReport.title + " in " + crimeReport.city,
          timestamp: new Date(),
        });

        // Notify City-level Sub Admin (city-specific reports)
        io.to("city_" + city).emit("newCrimeReport", {
          type: "NEW_CRIME_REPORT",
          data: {
            _id: crimeReport._id,
            reportId: crimeReport.reportId,
            title: crimeReport.title,
            description: crimeReport.description,
            crimeType: crimeReport.crimeType,
            city: crimeReport.city,
            area: crimeReport.area,
            address: crimeReport.address,
            status: crimeReport.status,
            priority: crimeReport.priority,
            location: crimeReport.location,
            dateOfCrime: crimeReport.dateOfCrime,
            approxTimeOfCrime: crimeReport.approxTimeOfCrime,
            createdAt: crimeReport.createdAt,
            evidence: crimeReport.evidence, // Include evidence in notification
          },
          message: "New crime report in your city: " + crimeReport.title,
          timestamp: new Date(),
        });

        console.log("Real-time notification sent for report: " + crimeReport.title);
      }
    } catch (socketError) {
      console.error("Socket notification error:", socketError);
      // Don't fail the request if socket fails
    }

    return res.status(201).json({
      message: "Crime report submitted successfully",
      crimeReport,
    });
  } catch (error) {
    console.error("Create Crime Error:", error);
    
    // Check if it's a timeout error
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      console.error("Upload timeout - Cloudinary may be slow or unreachable");
      return res.status(504).json({
        message: "File upload timed out. Please try again with a smaller file or check your internet connection.",
        error: "Upload Timeout"
      });
    }
    
    // Check if it's a Cloudinary configuration error
    if (error.message && error.message.includes('Cloudinary is not configured')) {
      return res.status(503).json({
        message: "File upload service is currently unavailable. Please contact the administrator to configure Cloudinary storage.",
        details: "Cloudinary API credentials are missing or invalid."
      });
    }
    
    // Check for network errors
    if (error.message && (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED') || error.message.includes('network'))) {
      return res.status(503).json({
        message: "Unable to connect to file storage service. Please check your internet connection and try again.",
        error: "Network Error"
      });
    }
    
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = { createCrimeReport };
