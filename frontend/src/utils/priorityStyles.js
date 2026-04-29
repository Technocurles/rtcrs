const PRIORITY_CONFIG = {
  critical: {
    label: "Critical",
    marker: "#dc2626",
    bg: "bg-red-600",
    textColor: "text-white",
    badgeSolid: "bg-red-600 text-white",
    badgeSoft: "bg-red-100 text-red-800",
    text: "text-red-600",
    dot: "bg-red-600",
    bgSoft: "bg-red-50",
  },
  high: {
    label: "High",
    marker: "#ea580c",
    bg: "bg-orange-600",
    textColor: "text-white",
    badgeSolid: "bg-orange-600 text-white",
    badgeSoft: "bg-orange-100 text-orange-800",
    text: "text-orange-600",
    dot: "bg-orange-600",
    bgSoft: "bg-orange-50",
  },
  medium: {
    label: "Medium",
    marker: "#eab308",
    bg: "bg-yellow-500",
    textColor: "text-white",
    badgeSolid: "bg-yellow-500 text-white",
    badgeSoft: "bg-yellow-100 text-yellow-800",
    text: "text-yellow-600",
    dot: "bg-yellow-500",
    bgSoft: "bg-yellow-50",
  },
  low: {
    label: "Low",
    marker: "#22c55e",
    bg: "bg-green-500",
    textColor: "text-white",
    badgeSolid: "bg-green-500 text-white",
    badgeSoft: "bg-green-100 text-green-800",
    text: "text-green-600",
    dot: "bg-green-500",
    bgSoft: "bg-green-50",
  },
  default: {
    label: "Not Set",
    marker: "#6b7280",
    bg: "bg-gray-500",
    textColor: "text-white",
    badgeSolid: "bg-gray-500 text-white",
    badgeSoft: "bg-gray-100 text-gray-800",
    text: "text-gray-600",
    dot: "bg-gray-500",
    bgSoft: "bg-gray-50",
  },
};

export const normalizePriority = (priority) => {
  const normalized = String(priority || "").trim().toLowerCase();
  return PRIORITY_CONFIG[normalized] ? normalized : "default";
};

export const getPriorityStyle = (priority) => {
  return PRIORITY_CONFIG[normalizePriority(priority)];
};

export const getPriorityMarkerColor = (priority) => {
  return getPriorityStyle(priority).marker;
};

export const getPriorityLabel = (priority) => {
  return getPriorityStyle(priority).label;
};

export const matchesPriority = (priority, expectedPriority) => {
  return normalizePriority(priority) === normalizePriority(expectedPriority);
};
