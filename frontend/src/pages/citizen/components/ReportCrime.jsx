import { useState, useRef } from "react";
import axios from "axios";

export default function ReportCrime() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    crimeType: "",
    otherCrimeType: "",
    division: "",
    city: "",
    area: "",
    address: "",
    isAnonymous: false,
    latitude: "",
    longitude: "",
    dateOfCrime: "",
    approxTimeOfCrime: "",
  });

  // Separate state for each file type
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  
  // Preview URLs for each type
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [audioPreviews, setAudioPreviews] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  // Refs for file inputs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // Allowed formats
  const allowedImageFormats = ['image/jpeg', 'image/jpg', 'image/png'];
  const allowedVideoFormats = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  const allowedAudioFormats = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4'];

  // Max sizes
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB
  const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
          setLocationLoading(false);
        },
        (err) => {
          console.error("Location error:", err);
          setError("Unable to get location. Please enable location access.");
          setLocationLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLocationLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "city") {
      setFormData((prev) => ({
        ...prev,
        city: value,
        area: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = [];
    const newPreviews = [];
    const errors = [];

    for (const file of files) {
      // Validate format
      if (!allowedImageFormats.includes(file.type)) {
        errors.push(`${file.name}: Only JPG, JPEG, PNG allowed`);
        continue;
      }
      // Validate size
      if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`${file.name}: Image exceeds 5MB`);
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    // Combine with existing images (max 5 total)
    const totalImages = [...images, ...validFiles];
    if (totalImages.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setImages(totalImages);
    setImagePreviews([...imagePreviews, ...newPreviews]);
    if (errors.length > 0) setError(errors.join('\n'));
    else setError("");
    
    // Reset input
    e.target.value = "";
  };

  // Handle video upload
  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = [];
    const newPreviews = [];
    const errors = [];

    for (const file of files) {
      // Validate format
      if (!allowedVideoFormats.includes(file.type)) {
        errors.push(`${file.name}: Only MP4, WebM, OGG allowed`);
        continue;
      }
      // Validate size
      if (file.size > MAX_VIDEO_SIZE) {
        errors.push(`${file.name}: Video exceeds 25MB`);
        continue;
      }
      validFiles.push(file);
      // Create video preview URL
      newPreviews.push({
        url: URL.createObjectURL(file),
        name: file.name
      });
    }

    // Combine with existing videos (max 2 total)
    const totalVideos = [...videos, ...validFiles];
    if (totalVideos.length > 2) {
      setError("Maximum 2 videos allowed");
      return;
    }

    setVideos(totalVideos);
    setVideoPreviews([...videoPreviews, ...newPreviews]);
    if (errors.length > 0) setError(errors.join('\n'));
    else setError("");
    
    // Reset input
    e.target.value = "";
  };

  // Handle audio upload
  const handleAudioChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = [];
    const newPreviews = [];
    const errors = [];

    for (const file of files) {
      // Validate format
      if (!allowedAudioFormats.includes(file.type)) {
        errors.push(`${file.name}: Only MP3, WAV, OGG, M4A allowed`);
        continue;
      }
      // Validate size
      if (file.size > MAX_AUDIO_SIZE) {
        errors.push(`${file.name}: Audio exceeds 10MB`);
        continue;
      }
      validFiles.push(file);
      // Create audio preview
      newPreviews.push({
        url: URL.createObjectURL(file),
        name: file.name
      });
    }

    // Combine with existing audio (max 2 total)
    const totalAudio = [...audioFiles, ...validFiles];
    if (totalAudio.length > 2) {
      setError("Maximum 2 audio files allowed");
      return;
    }

    setAudioFiles(totalAudio);
    setAudioPreviews([...audioPreviews, ...newPreviews]);
    if (errors.length > 0) setError(errors.join('\n'));
    else setError("");
    
    // Reset input
    e.target.value = "";
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(imagePreviews[index]); // Clean up memory
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Remove video
  const removeVideo = (index) => {
    const newVideos = [...videos];
    const newPreviews = [...videoPreviews];
    URL.revokeObjectURL(videoPreviews[index].url); // Clean up memory
    newVideos.splice(index, 1);
    newPreviews.splice(index, 1);
    setVideos(newVideos);
    setVideoPreviews(newPreviews);
  };

  // Remove audio
  const removeAudio = (index) => {
    const newAudio = [...audioFiles];
    const newPreviews = [...audioPreviews];
    URL.revokeObjectURL(audioPreviews[index].url); // Clean up memory
    newAudio.splice(index, 1);
    newPreviews.splice(index, 1);
    setAudioFiles(newAudio);
    setAudioPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.title || !formData.description || !formData.crimeType ||
          !formData.city || !formData.area || !formData.dateOfCrime || !formData.approxTimeOfCrime) {
        throw new Error("Please fill in all required fields");
      }

      if (formData.crimeType === "Other" && !formData.otherCrimeType.trim()) {
        throw new Error("Please specify the crime type");
      }

      // Check total files
      const totalFiles = images.length + videos.length + audioFiles.length;
      if (totalFiles > 5) {
        throw new Error("Maximum 5 evidence files allowed in total");
      }

      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      
      const finalCrimeType = formData.crimeType === "Other" ? formData.otherCrimeType : formData.crimeType;
      data.append("crimeType", finalCrimeType);
      data.append("dateOfCrime", formData.dateOfCrime);
      data.append("approxTimeOfCrime", formData.approxTimeOfCrime);
      data.append("division", formData.city);
      data.append("city", formData.city);
      data.append("area", formData.area);
      data.append("address", formData.address);
      data.append("isAnonymous", formData.isAnonymous);

      if (formData.latitude && formData.longitude) {
        const location = {
          type: "Point",
          coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
        };
        data.append("location", JSON.stringify(location));
      }

      // Append all evidence files
      images.forEach((file) => data.append("evidence", file));
      videos.forEach((file) => data.append("evidence", file));
      audioFiles.forEach((file) => data.append("evidence", file));

      console.log("========== FRONTEND DEBUG ==========");
      console.log("Images:", images.length, "Videos:", videos.length, "Audio:", audioFiles.length);
      console.log("Total files:", totalFiles);
      console.log("====================================");

      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      
      const response = await fetch("/api/crime/report", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit report");
      }
      const result = await response.json();

      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        crimeType: "",
        otherCrimeType: "",
        division: "",
        city: "",
        area: "",
        address: "",
        isAnonymous: false,
        latitude: "",
        longitude: "",
        dateOfCrime: "",
        approxTimeOfCrime: "",
      });
      setImages([]);
      setVideos([]);
      setAudioFiles([]);
      setImagePreviews([]);
      setVideoPreviews([]);
      setAudioPreviews([]);

    } catch (err) {
      console.error("Submit report error:", err);
      const errorMessage = err.response?.data?.message || err.message || "";
      
      if (err.response?.status === 401 || errorMessage.includes("expired") || errorMessage.includes("Invalid token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setError("Your session has expired. Please log in again.");
        setTimeout(() => {
          window.location.href = "/login?reason=session_expired";
        }, 2000);
      } else {
        setError(err.response?.data?.message || err.message || "Failed to submit report");
      }
    } finally {
      setLoading(false);
    }
  };

  const crimeTypes = [
    "Child Sexual Abuse",
    "Child Exploitation & Trafficking",
    "Child Abuse & Neglect",
    "Domestic Violence",
    "Rape & Sexual Violence",
    "Harassment & Stalking",
    "Dowry-related Abuse",
    "Acid Attack",
    "Forced Prostitution",
    "Workplace Harassment",
    "Online Fraud",
    "Identity Theft",
    "Cyberbullying",
    "Hacking & Data Breach",
    "Phishing Attack",
    "Social Media Account Hacking",
    "Business Email Compromise",
    "Theft",
    "Burglary",
    "Vandalism",
    "Property Fraud",
    "Land Grabbing",
    "Murder",
    "Attempt to Murder",
    "Culpable Homicide",
    "Voluntarily Causing Hurt",
    "Voluntarily Causing Grievous Hurt",
    "Assault",
    "Kidnapping",
    "Abduction",
    "Robbery",
    "Dacoity",
    "Extortion",
    "Criminal Intimidation",
    "Money Laundering",
    "Tax Evasion",
    "Tax Fraud",
    "Bank Fraud",
    "Credit Card Fraud",
    "Insurance Fraud",
    "Embezzlement",
    "Insider Trading",
    "Ponzi Scheme",
    "Black Money",
    "Drug Trafficking",
    "Drug Possession",
    "Drug Manufacturing",
    "Drug Peddling",
    "Consumption in Public",
    "Sale to Minors",
    "Drug Smuggling",
    "Organized Gangs",
    "Human Trafficking",
    "Drug Cartels",
    "Arms Trafficking",
    "Smuggling",
    "Money Laundering Networks",
    "Terrorism Financing",
    "Kidnapping Rackets",
    "Fraud",
    "Corruption",
    "Bribery",
    "Accident",
    "Missing Persons",
    "Missing Person",
    "Missing Children",
    "Missing Women",
    "Kidnapping for Ransom",
    "Trafficking",
    "Driving Under Influence (DUI)",
    "Rash Driving",
    "Speeding",
    "Hit and Run",
    "Driving Without License",
    "Vehicle Theft",
    "Traffic Signal Violation",
    "Illegal Parking",
    "Public Nuisance",
    "Noise Pollution",
    "Drunk & Disorderly",
    "Begging",
    "Public Indecency",
    "Unlawful Assembly",
    "Rioting",
    "Elder Abuse",
    "Financial Exploitation",
    "Neglect of Elderly",
    "Physical Abuse",
    "Emotional Abuse",
    "Healthcare Fraud",
    "Property Theft",
    "Illegal Mining",
    "Illegal Logging",
    "Poaching",
    "Illegal Fishing",
    "Waste Dumping",
    "Air Pollution Violations",
    "Water Pollution",
    "Hazardous Waste Disposal",
    "Wildlife Trade",
    "Deforestation",
    "Sexual Harassment at Work",
    "Workplace Violence",
    "Discrimination",
    "Wrongful Termination",
    "Wage Theft",
    "Safety Violations",
    "Child Labor",
    "Racial Violence",
    "Religious Hate Crimes",
    "Communal Violence",
    "Caste-based Violence",
    "LGBTQ+ Hate Crimes",
    "Disability-based Hate",
    "Xenophobia",
    "Marital Rape",
    "Child Abuse",
    "Psychological Abuse",
    "Economic Abuse",
    "Stalking by Partner",
    "Adulteration",
    "Sale of Expired Goods",
    "Counterfeiting",
    "Price Manipulation",
    "Quality Violations",
    "False Advertising",
    "Food Adulteration",
    "Medical Device Fraud",
    "Ragging",
    "Bullying in Schools",
    "Sexual Harassment in Campus",
    "Exam Cheating",
    "Paper Leaking",
    "Education Fraud",
    "Fee Manipulation",
    "Animal Cruelty",
    "Illegal Animal Trade",
    "Neglect of Animals",
    "Bestiality",
    "Animal Fighting",
    "Illegal Hunting",
    "Online Child Grooming",
    "Child Pornography",
    "Child Marriage",
    "Stray Animal Issues",
    "Environmental Violations",
    "Uncategorized Offenses",
    "Other",
  ];

  const divisions = [
    "Ahmedabad", "Surat", "Vadodara", "Anand", "Kheda", "Chhota Udaipur",
    "Dahod", "Mahisagar", "Bharuch", "Narmada", "Navsari", "Valsad",
    "Dang", "Tapi", "Rajkot", "Jamnagar", "Junagadh", "Porbandar",
    "Bhavnagar", "Amreli", "Surendranagar", "Morbi", "Botad",
    "Devbhumi Dwarka", "Gir Somnath", "Kutch", "Banaskantha", "Patan",
    "Mehsana", "Sabarkantha", "Aravalli", "Gandhinagar"
  ];

  const cityAreas = {
    "Ahmedabad": ["Satellite","Ambawadi","Navrangpura","Naranpura","Paldi","Vasna","Vastrapur","Gurukul","Jodhpur","Bopal","Gota","Chandkheda","Motera","Thaltej","Bodakdev","Sindhu Bhavan Road","Ambli","Bhadra","Khadia","Dariapur","Jamalpur","Shahpur","Kalupur","Gheekanta","Maninagar","Amraiwadi","Bapunagar","Hatkeshwar","Vatva","Naroda","Odhav","Asarwa","SG Highway","Prahlad Nagar","Sindhu Bhavan Marg","Shahibaug","Dudheshwar","Chandlodia","Ranip","Memnagar"],
    "Surat": ["Nanpura","Gopipura","Begampura","Rander","Salabatpura","Haripura","Mahidharpura","Zampa Bazaar","Delhi Gate","Shahpore","Ring Road","Sahara Darwaja","Textile Market","Bombay Market","Millennium Market","Adajan","Pal","Palanpur","Jahangirpura","Anand Mahal Road","LP Savani","Dabholi","Athwa","Athwalines","City Light","Vesu","VIP Road","Althan","Bhatar","Piplod","Rundh","Dumas Road","Varachha","Mini Bazar","Kapodra","Katargam","Amroli","Singanpor","Udhna","Pandesara","Sachin","Magob","Kamrej","Kosad","Mota Varachha"],
    "Vadodara": ["Alkapuri","Sayajigunj","Fatehgunj","Karelibaug","Nizampura","Sama","Sama Savli Road","Subhanpura","Gotri","Gotri Road","Harni","Harni Road","Airport Road","New VIP Road","VIP Road","Ajwa Road","Waghodia Road","Manjalpur","Tarsali","Makarpura","Akota","Ellora Park","Vasna Road","Bhayli","Sevasi","Chhani","Gorwa","Raopura","Mandvi","Dandia Bazar","Laheripura","Pratapnagar","Soma Talav","Kalali","Race Course Circle"],
    "Gandhinagar": ["Gandhinagar City","Sector 1","Sector 2","Sector 3","Sector 4","Sector 5","Sector 6","Sector 7","Sector 8","Sector 9","Sector 10","Sector 11","Sector 12","Sector 13","Sector 14","Sector 15","Sector 16","Sector 17","Sector 18","Sector 19","Sector 20","Infocity","GIFT City","Raysan","Sargasan","Kudasan","Pethapur"],
    "Rajkot": ["Rajkot City","Kalawad Road","University Road","Raiya Road","150 Feet Ring Road","80 Feet Road","Yagnik Road","Race Course","Amin Marg","Nana Mava Road","Gondal Road","Morbi Road","Jamnagar Road","Kuvadva Road","Mavdi","Madhapar","Dhebar Road","Sadhu Vaswani Road","Sadar Bazaar","Indira Circle","Shastri Nagar"],
    "Other": ["Central Area", "Main Road", "Market Area", "Station Road", "Bus Stand"]
  };

  // Upload Box Component
  const UploadBox = ({ type, icon, label, count, max, accept, onChange, onClick, previews, onRemove, colorClass, bgClass }) => (
    <div className="flex flex-col items-center">
      <div 
        onClick={onClick}
        className={`w-28 h-28 ${bgClass} border-2 border-dashed ${colorClass} rounded-xl cursor-pointer hover:opacity-80 transition-all flex flex-col items-center justify-center gap-1 group`}
      >
        <div className={`text-3xl ${colorClass} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs text-gray-400">{count}/{max}</span>
      </div>
      <input
        type="file"
        ref={type === 'image' ? imageInputRef : type === 'video' ? videoInputRef : audioInputRef}
        onChange={onChange}
        accept={accept}
        className="hidden"
        multiple={type !== 'video' && type !== 'audio'}
      />
      {/* Previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 justify-center">
          {previews.map((preview, index) => (
            <div key={index} className="relative">
              {type === 'image' ? (
                <img src={preview} alt={`Preview ${index + 1}`} className="w-12 h-12 object-cover rounded-lg border-2 border-blue-200" />
              ) : type === 'video' ? (
                <div className="w-12 h-12 bg-purple-100 rounded-lg border-2 border-purple-200 flex items-center justify-center">
                  <span className="text-purple-500 text-xs">🎥</span>
                </div>
              ) : (
                <div className="w-12 h-12 bg-green-100 rounded-lg border-2 border-green-200 flex items-center justify-center">
                  <span className="text-green-500 text-xs">🎵</span>
                </div>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Report Submitted Successfully!</h2>
          <p className="text-green-700 mb-4">Your crime report has been submitted. The relevant authorities have been notified.</p>
          <button onClick={() => setSuccess(false)} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Submit Another Report</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Report a Crime</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Crime Type *</label>
          <select name="crimeType" value={formData.crimeType} onChange={handleChange} autoComplete="off" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Select Crime Type</option>
            {crimeTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
          </select>
        </div>

        {formData.crimeType === "Other" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specify Crime Type *</label>
            <input type="text" name="otherCrimeType" value={formData.otherCrimeType} onChange={handleChange} autoComplete="off" required placeholder="Please specify" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Crime *</label>
            <input type="date" name="dateOfCrime" value={formData.dateOfCrime} onChange={handleChange} autoComplete="off" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approx Time of Crime *</label>
            <input type="time" name="approxTimeOfCrime" value={formData.approxTimeOfCrime} onChange={handleChange} autoComplete="off" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} autoComplete="off" required maxLength={150} placeholder="Brief title" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea name="description" value={formData.description} onChange={handleChange} autoComplete="off" required maxLength={2000} rows={4} placeholder="Describe what happened" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Division/City *</label>
            <select name="city" value={formData.city} onChange={handleChange} autoComplete="off" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Select City</option>
              {divisions.map((city) => (<option key={city} value={city}>{city}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
            <select name="area" value={formData.area} onChange={handleChange} autoComplete="off" required disabled={!formData.city} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
              <option value="">{formData.city ? "Select Area" : "Select City First"}</option>
              {formData.city && cityAreas[formData.city]?.map((area) => (<option key={area} value={area}>{area}</option>))}
              {formData.city && !cityAreas[formData.city] && cityAreas["Other"]?.map((area) => (<option key={area} value={area}>{area}</option>))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} autoComplete="off" placeholder="Full address" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="hidden">
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Location (Optional)</label>
          <div className="flex gap-2">
            <button type="button" onClick={getCurrentLocation} disabled={locationLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
              {locationLoading ? "Getting Location..." : "Get Current Location"}
            </button>
            {formData.latitude && formData.longitude && <span className="text-green-600 self-center">✓ Location captured</span>}
          </div>
        </div>

        {/* Evidence Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Upload Evidence</label>
          
          {/* Three Upload Squares */}
          <div className="flex justify-center gap-4 flex-wrap">
            {/* Image Upload Box */}
            <UploadBox 
              type="image"
              icon="📷"
              label="Image"
              count={images.length}
              max={5}
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageChange}
              onClick={() => imageInputRef.current?.click()}
              previews={imagePreviews}
              onRemove={removeImage}
              colorClass="text-blue-500"
              bgClass="bg-blue-50"
            />

            {/* Video Upload Box */}
            <UploadBox 
              type="video"
              icon="🎥"
              label="Video"
              count={videos.length}
              max={2}
              accept="video/mp4,video/webm,video/ogg"
              onChange={handleVideoChange}
              onClick={() => videoInputRef.current?.click()}
              previews={videoPreviews}
              onRemove={removeVideo}
              colorClass="text-purple-500"
              bgClass="bg-purple-50"
            />

            {/* Audio Upload Box */}
            <UploadBox 
              type="audio"
              icon="🎤"
              label="Audio"
              count={audioFiles.length}
              max={2}
              accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4"
              onChange={handleAudioChange}
              onClick={() => audioInputRef.current?.click()}
              previews={audioPreviews}
              onRemove={removeAudio}
              colorClass="text-green-500"
              bgClass="bg-green-50"
            />
          </div>

          {/* Format Info */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            <span className="text-blue-500">Images:</span> JPG, JPEG, PNG (max 5MB) • 
            <span className="text-purple-500"> Videos:</span> MP4, WebM, OGG (max 25MB) • 
            <span className="text-green-500"> Audio:</span> MP3, WAV, OGG, M4A (max 10MB)
          </div>
        </div>

        <div className="flex items-center">
          <input type="checkbox" name="isAnonymous" id="isAnonymous" checked={formData.isAnonymous} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          <label htmlFor="isAnonymous" className="ml-2 text-sm text-gray-700">Submit anonymously</label>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}

