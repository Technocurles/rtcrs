/**
 * Crime Severity Mapping Utility
 * Maps crime types to their severity levels
 * Severity levels: critical, high, medium, low
 */

// Crime type to severity mapping based on user requirements
const crimeSeverityMap = {
  // Crimes Against Children
  "Child Sexual Abuse": "critical",
  "Child Exploitation & Trafficking": "critical",
  "Child Abuse & Neglect": "high",

  // Crimes Against Women
  "Domestic Violence": "critical",
  "Rape & Sexual Violence": "critical",
  "Harassment & Stalking": "high",
  "Dowry-related Abuse": "high",
  "Acid Attack": "critical",
  "Workplace Harassment": "medium",
  "Forced Prostitution": "critical",

  // Cyber Crimes
  "Online Fraud": "high",
  "Identity Theft": "high",
  "Cyberbullying": "medium",
  "Hacking & Data Breach": "critical",
  "Phishing Attack": "high",
  "Social Media Account Hacking": "medium",
  "Business Email Compromise": "critical",

  // Property Crimes
  "Theft": "high",
  "Burglary": "high",
  "Vandalism": "medium",
  "Property Fraud": "high",
  "Land Grabbing": "high",

  // Violent Crimes
  "Murder": "critical",
  "Attempt to Murder": "critical",
  "Culpable Homicide": "critical",
  "Voluntarily Causing Hurt": "high",
  "Voluntarily Causing Grievous Hurt": "critical",
  "Assault": "high",
  "Kidnapping": "critical",
  "Abduction": "critical",
  "Robbery": "high",
  "Dacoity": "critical",
  "Extortion": "high",
  "Criminal Intimidation": "medium",

  // Financial Crimes
  "Money Laundering": "critical",
  "Tax Evasion": "high",
  "Tax Fraud": "high",
  "Bank Fraud": "critical",
  "Credit Card Fraud": "high",
  "Insurance Fraud": "medium",
  "Embezzlement": "high",
  "Insider Trading": "high",
  "Ponzi Scheme": "critical",
  "Black Money": "high",

  // Drug-Related Crimes
  "Drug Trafficking": "critical",
  "Drug Possession": "high",
  "Drug Manufacturing": "critical",
  "Drug Peddling": "critical",
  "Consumption in Public": "medium",
  "Sale to Minors": "critical",
  "Drug Smuggling": "critical",

  // Organized Crimes
  "Organized Gangs": "critical",
  "Human Trafficking": "critical",
  "Drug Cartels": "critical",
  "Arms Trafficking": "critical",
  "Smuggling": "high",
  "Money Laundering Networks": "critical",
  "Terrorism Financing": "critical",
  "Kidnapping Rackets": "critical",

  // Other Common Crimes
  "Fraud": "low",
  "Corruption": "high",
  "Bribery": "high",
  "Accident": "critical",
  "Missing Persons": "critical",
  "Missing Person": "critical",
  "Missing Children": "critical",
  "Missing Women": "critical",
  "Kidnapping for Ransom": "critical",
  "Trafficking": "critical",

  // Traffic Offenses
  "Driving Under Influence (DUI)": "high",
  "Rash Driving": "high",
  "Speeding": "medium",
  "Hit and Run": "critical",
  "Driving Without License": "medium",
  "Vehicle Theft": "high",
  "Traffic Signal Violation": "low",
  "Illegal Parking": "low",

  // Public Safety Crimes
  "Public Nuisance": "low",
  "Noise Pollution": "low",
  "Drunk & Disorderly": "medium",
  "Begging": "low",
  "Public Indecency": "medium",
  "Unlawful Assembly": "high",
  "Rioting": "high",

  // Crimes Against Elderly
  "Elder Abuse": "high",
  "Financial Exploitation": "high",
  "Neglect of Elderly": "high",
  "Physical Abuse": "critical",
  "Emotional Abuse": "medium",
  "Healthcare Fraud": "high",
  "Property Theft": "high",

  // Environmental Crimes
  "Illegal Mining": "high",
  "Illegal Logging": "high",
  "Poaching": "critical",
  "Illegal Fishing": "medium",
  "Waste Dumping": "high",
  "Air Pollution Violations": "medium",
  "Water Pollution": "high",
  "Hazardous Waste Disposal": "critical",
  "Wildlife Trade": "critical",
  "Deforestation": "high",

  // Workplace Crimes
  "Workplace Harassment": "medium",
  "Sexual Harassment at Work": "high",
  "Workplace Violence": "high",
  "Discrimination": "medium",
  "Wrongful Termination": "low",
  "Wage Theft": "high",
  "Safety Violations": "medium",
  "Child Labor": "critical",

  // Hate Crimes
  "Racial Violence": "critical",
  "Religious Hate Crimes": "critical",
  "Communal Violence": "critical",
  "Caste-based Violence": "critical",
  "LGBTQ+ Hate Crimes": "high",
  "Disability-based Hate": "high",
  "Xenophobia": "high",

  // Domestic Crimes
  "Marital Rape": "critical",
  "Child Abuse": "critical",
  "Psychological Abuse": "high",
  "Economic Abuse": "medium",
  "Stalking by Partner": "high",

  // Terrorism-Related Crimes
  "Terrorist Activities": "critical",
  "Terrorist Financing": "critical",
  "Terrorist Recruitment": "critical",
  "Bomb Threats": "critical",
  "Explosive Possession": "critical",
  "Terrorist Conspiracy": "critical",
  "Waging War Against Nation": "critical",

  // Consumer Protection Crimes
  "Adulteration": "high",
  "Sale of Expired Goods": "medium",
  "Counterfeiting": "high",
  "Price Manipulation": "medium",
  "Quality Violations": "high",
  "False Advertising": "medium",
  "Food Adulteration": "critical",
  "Medical Device Fraud": "critical",

  // Education-Related Crimes
  "Ragging": "high",
  "Bullying in Schools": "medium",
  "Sexual Harassment in Campus": "critical",
  "Exam Cheating": "low",
  "Paper Leaking": "high",
  "Education Fraud": "high",
  "Fee Manipulation": "medium",

  // Crimes Against Animals
  "Animal Cruelty": "high",
  "Illegal Animal Trade": "critical",
  "Neglect of Animals": "medium",
  "Bestiality": "critical",
  "Animal Fighting": "high",
  "Illegal Hunting": "high",

  // General/Other Crimes
  "Other": "medium",
  "Stray Animal Issues": "low",
  "Environmental Violations": "medium",
  "Uncategorized Offenses": "medium",

  // Additional variations
  "Online Child Grooming": "critical",
  "Child Pornography": "critical",
  "Child Marriage": "high",
  "Forced Prostitution": "critical",
  "Child Labor": "high",
};

/**
 * Get the severity level for a given crime type
 * @param {string} crimeType - The crime type string
 * @returns {string} The severity level: 'critical', 'high', 'medium', or 'low'
 */
const getCrimeSeverity = (crimeType) => {
  if (!crimeType) return "medium";

  // Try to find exact match first
  if (crimeSeverityMap[crimeType]) {
    return crimeSeverityMap[crimeType];
  }

  // Try case-insensitive match
  const lowerCrimeType = crimeType.toLowerCase();
  for (const key of Object.keys(crimeSeverityMap)) {
    if (key.toLowerCase() === lowerCrimeType) {
      return crimeSeverityMap[key];
    }
  }

  // Try partial match
  for (const key of Object.keys(crimeSeverityMap)) {
    if (lowerCrimeType.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCrimeType)) {
      return crimeSeverityMap[key];
    }
  }

  // Default to medium if no match found
  return "medium";
};

/**
 * Get priority color for map markers
 * @param {string} priority - The priority level
 * @returns {string} Hex color code
 */
const getPriorityColor = (priority) => {
  const colors = {
    critical: "#dc2626", // Red-600
    high: "#ea580c",     // Orange-600
    medium: "#f59e0b",   // Amber-500
    low: "#22c55e",      // Green-500
    default: "#6b7280", // Gray-500
  };

  return colors[priority] || colors.default;
};

module.exports = {
  crimeSeverityMap,
  getCrimeSeverity,
  getPriorityColor,
};

