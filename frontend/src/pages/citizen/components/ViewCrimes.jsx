import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Shield, 
  Users, 
  Smartphone, 
  Building2, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  Heart,
  Lock,
  Briefcase,
  DollarSign,
  Car,
  Scale,
  UserCheck,
  Leaf,
  Factory,
  Pill,
  Bus,
  FileWarning,
  Skull,
  Wallet,
  PawPrint,
  Home,
  Bomb,
  UserSearch,
  GraduationCap,
  ShoppingCart,
  Gavel,
  Ban,
  TrendingUp,
  Landmark
} from "lucide-react";
import { normalizePriority } from "../../../utils/priorityStyles";

// Crime data organized by category
const crimeCategories = [
  {
    id: "children",
    title: "Crimes Against Children",
    description: "Protecting our most vulnerable - awareness and reporting resources",
    icon: Heart,
    color: "bg-rose-100 text-rose-600",
    borderColor: "border-rose-200",
    crimes: [
      { title: "Child Sexual Abuse", severity: "Critical" },
      { title: "Child Exploitation & Trafficking", severity: "Critical" },
      { title: "Child Abuse & Neglect", severity: "High" },
      { title: "Online Child Grooming", severity: "Critical" },
      { title: "Child Labor", severity: "High" },
      { title: "Child Pornography", severity: "Critical" },
      { title: "Child Marriage", severity: "High" }
    ]
  },
  {
    id: "women",
    title: "Crimes Against Women",
    description: "Safety resources and support for women",
    icon: Users,
    color: "bg-purple-100 text-purple-600",
    borderColor: "border-purple-200",
    crimes: [
      { title: "Domestic Violence", severity: "Critical" },
      { title: "Rape & Sexual Violence", severity: "Critical" },
      { title: "Harassment & Stalking", severity: "High" },
      { title: "Dowry-related Abuse", severity: "High" },
      { title: "Acid Attack", severity: "Critical" },
      { title: "Workplace Harassment", severity: "Medium" },
      { title: "Forced Prostitution", severity: "Critical" }
    ]
  },
  {
    id: "cyber",
    title: "Cyber Crimes",
    description: "Digital safety and online threat awareness",
    icon: Smartphone,
    color: "bg-blue-100 text-blue-600",
    borderColor: "border-blue-200",
    crimes: [
      { title: "Online Fraud", severity: "High" },
      { title: "Identity Theft", severity: "High" },
      { title: "Cyberbullying", severity: "Medium" },
      { title: "Hacking & Data Breach", severity: "Critical" },
      { title: "Phishing Attack", severity: "High" },
      { title: "Social Media Account Hacking", severity: "Medium" },
      { title: "Business Email Compromise", severity: "Critical" }
    ]
  },
  {
    id: "property",
    title: "Property Crimes",
    description: "Protection against property-related offenses",
    icon: Building2,
    color: "bg-amber-100 text-amber-600",
    borderColor: "border-amber-200",
    crimes: [
      { title: "Theft", severity: "High" },
      { title: "Burglary", severity: "High" },
      { title: "Vandalism", severity: "Medium" },
      { title: "Property Fraud", severity: "High" },
      { title: "Land Grabbing", severity: "High" }
    ]
  },
  {
    id: "violent",
    title: "Violent Crimes",
    description: "Serious offenses involving physical harm or threat",
    icon: Skull,
    color: "bg-red-100 text-red-600",
    borderColor: "border-red-200",
    crimes: [
      { title: "Murder", severity: "Critical" },
      { title: "Attempt to Murder", severity: "Critical" },
      { title: "Culpable Homicide", severity: "Critical" },
      { title: "Voluntarily Causing Hurt", severity: "High" },
      { title: "Voluntarily Causing Grievous Hurt", severity: "Critical" },
      { title: "Assault", severity: "High" },
      { title: "Kidnapping", severity: "Critical" },
      { title: "Abduction", severity: "Critical" },
      { title: "Robbery", severity: "High" },
      { title: "Dacoity", severity: "Critical" },
      { title: "Extortion", severity: "High" },
      { title: "Criminal Intimidation", severity: "Medium" }
    ]
  },
  {
    id: "financial",
    title: "Financial Crimes",
    description: "Economic offenses and money-related crimes",
    icon: DollarSign,
    color: "bg-green-100 text-green-600",
    borderColor: "border-green-200",
    crimes: [
      { title: "Money Laundering", severity: "Critical" },
      { title: "Tax Evasion", severity: "High" },
      { title: "Tax Fraud", severity: "High" },
      { title: "Bank Fraud", severity: "Critical" },
      { title: "Credit Card Fraud", severity: "High" },
      { title: "Insurance Fraud", severity: "Medium" },
      { title: "Embezzlement", severity: "High" },
      { title: " Insider Trading", severity: "High" },
      { title: "Ponzi Scheme", severity: "Critical" },
      { title: "Black Money", severity: "High" }
    ]
  },
  {
    id: "public",
    title: "Public Safety Crimes",
    description: "Offenses affecting community safety and order",
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-600",
    borderColor: "border-orange-200",
    crimes: [
      { title: "Public Nuisance", severity: "Low" },
      { title: "Noise Pollution", severity: "Low" },
      { title: "Illegal Parking", severity: "Low" },
      { title: "Drunk & Disorderly", severity: "Medium" },
      { title: "Begging", severity: "Low" },
      { title: "Public indecency", severity: "Medium" },
      { title: "Unlawful Assembly", severity: "High" },
      { title: "Rioting", severity: "High" }
    ]
  },
  {
    id: "organized",
    title: "Organized Crimes",
    description: "Coordinated criminal activities by groups",
    icon: Landmark,
    color: "bg-indigo-100 text-indigo-600",
    borderColor: "border-indigo-200",
    crimes: [
      { title: "Organized Gangs", severity: "Critical" },
      { title: "Human Trafficking", severity: "Critical" },
      { title: "Drug Cartels", severity: "Critical" },
      { title: "Arms Trafficking", severity: "Critical" },
      { title: "Smuggling", severity: "High" },
      { title: "Money Laundering Networks", severity: "Critical" },
      { title: "Terrorism Financing", severity: "Critical" },
      { title: "Kidnapping Rackets", severity: "Critical" }
    ]
  },
  {
    id: "elderly",
    title: "Crimes Against Elderly",
    description: "Protecting senior citizens from exploitation and abuse",
    icon: UserCheck,
    color: "bg-teal-100 text-teal-600",
    borderColor: "border-teal-200",
    crimes: [
      { title: "Elder Abuse", severity: "High" },
      { title: "Financial Exploitation", severity: "High" },
      { title: "Neglect of Elderly", severity: "High" },
      { title: "Physical Abuse", severity: "Critical" },
      { title: "Emotional Abuse", severity: "Medium" },
      { title: "Healthcare Fraud", severity: "High" },
      { title: "Property Theft", severity: "High" }
    ]
  },
  {
    id: "environmental",
    title: "Environmental Crimes",
    description: "Violations against nature and environmental laws",
    icon: Leaf,
    color: "bg-emerald-100 text-emerald-600",
    borderColor: "border-emerald-200",
    crimes: [
      { title: "Illegal Mining", severity: "High" },
      { title: "Illegal Logging", severity: "High" },
      { title: "Poaching", severity: "Critical" },
      { title: "Illegal Fishing", severity: "Medium" },
      { title: "Waste Dumping", severity: "High" },
      { title: "Air Pollution Violations", severity: "Medium" },
      { title: "Water Pollution", severity: "High" },
      { title: "Hazardous Waste Disposal", severity: "Critical" },
      { title: "Wildlife Trade", severity: "Critical" },
      { title: "Deforestation", severity: "High" }
    ]
  },
  {
    id: "workplace-crimes",
    title: "Workplace Crimes",
    description: "Criminal activities in employment contexts",
    icon: Briefcase,
    color: "bg-slate-100 text-slate-600",
    borderColor: "border-slate-200",
    crimes: [
      { title: "Workplace Harassment", severity: "Medium" },
      { title: "Sexual Harassment at Work", severity: "High" },
      { title: "Workplace Violence", severity: "High" },
      { title: "Discrimination", severity: "Medium" },
      { title: "Wrongful Termination", severity: "Low" },
      { title: "Wage Theft", severity: "High" },
      { title: "Safety Violations", severity: "Medium" },
      { title: "Child Labor", severity: "Critical" }
    ]
  },
  {
    id: "drugs",
    title: "Drug-Related Crimes",
    description: "Offenses involving illegal substances",
    icon: Pill,
    color: "bg-pink-100 text-pink-600",
    borderColor: "border-pink-200",
    crimes: [
      { title: "Drug Possession", severity: "High" },
      { title: "Drug Trafficking", severity: "Critical" },
      { title: "Drug Manufacturing", severity: "Critical" },
      { title: "Drug Peddling", severity: "Critical" },
      { title: "Consumption in Public", severity: "Medium" },
      { title: "Sale to Minors", severity: "Critical" },
      { title: "Drug Smuggling", severity: "Critical" }
    ]
  },
  {
    id: "traffic",
    title: "Traffic Offenses",
    description: "Violations of traffic rules and regulations",
    icon: Car,
    color: "bg-yellow-100 text-yellow-600",
    borderColor: "border-yellow-200",
    crimes: [
      { title: "Driving Under Influence (DUI)", severity: "High" },
      { title: "Rash Driving", severity: "High" },
      { title: "Speeding", severity: "Medium" },
      { title: "Hit and Run", severity: "Critical" },
      { title: "Driving Without License", severity: "Medium" },
      { title: "Vehicle Theft", severity: "High" },
      { title: "Traffic Signal Violation", severity: "Low" },
      { title: "Illegal Parking", severity: "Low" }
    ]
  },
  {
    id: "corruption",
    title: "Corruption & Bribery",
    description: "Offenses involving abuse of power for personal gain",
    icon: Scale,
    color: "bg-gray-100 text-gray-600",
    borderColor: "border-gray-200",
    crimes: [
      { title: "Bribery", severity: "High" },
      { title: "Corruption", severity: "High" },
      { title: "Embezzlement", severity: "High" },
      { title: "Abuse of Power", severity: "High" },
      { title: "Nepotism", severity: "Medium" },
      { title: "Favoritism", severity: "Low" },
      { title: "Kickbacks", severity: "High" },
      { title: "Misappropriation", severity: "High" }
    ]
  },
  {
    id: "hate",
    title: "Hate Crimes",
    description: "Criminal acts motivated by bias or prejudice",
    icon: Ban,
    color: "bg-red-100 text-red-600",
    borderColor: "border-red-200",
    crimes: [
      { title: "Racial Violence", severity: "Critical" },
      { title: "Religious Hate Crimes", severity: "Critical" },
      { title: "Communal Violence", severity: "Critical" },
      { title: "Caste-based Violence", severity: "Critical" },
      { title: "LGBTQ+ Hate Crimes", severity: "High" },
      { title: "Disability-based Hate", severity: "High" },
      { title: "Xenophobia", severity: "High" }
    ]
  },
  {
    id: "fraud",
    title: "Fraud & Scams",
    description: "Deceptive practices for financial gain",
    icon: Wallet,
    color: "bg-cyan-100 text-cyan-600",
    borderColor: "border-cyan-200",
    crimes: [
      { title: "Advance Fee Fraud", severity: "High" },
      { title: "Online Scams", severity: "High" },
      { title: "Ponzi Schemes", severity: "Critical" },
      { title: "Fake Job Scams", severity: "High" },
      { title: "Matrimonial Fraud", severity: "High" },
      { title: "Real Estate Fraud", severity: "High" },
      { title: "Insurance Fraud", severity: "Medium" },
      { title: "Loan Fraud", severity: "High" }
    ]
  },
  {
    id: "animals",
    title: "Crimes Against Animals",
    description: "Harmful acts towards animals",
    icon: PawPrint,
    color: "bg-lime-100 text-lime-600",
    borderColor: "border-lime-200",
    crimes: [
      { title: "Animal Cruelty", severity: "High" },
      { title: "Poaching", severity: "Critical" },
      { title: "Illegal Animal Trade", severity: "Critical" },
      { title: "Neglect of Animals", severity: "Medium" },
      { title: "Bestiality", severity: "Critical" },
      { title: "Animal Fighting", severity: "High" },
      { title: "Illegal Hunting", severity: "High" }
    ]
  },
  {
    id: "domestic",
    title: "Domestic Crimes",
    description: "Crimes occurring within domestic settings",
    icon: Home,
    color: "bg-rose-100 text-rose-600",
    borderColor: "border-rose-200",
    crimes: [
      { title: "Domestic Violence", severity: "Critical" },
      { title: "Marital Rape", severity: "Critical" },
      { title: "Child Abuse", severity: "Critical" },
      { title: "Elder Abuse", severity: "High" },
      { title: "Psychological Abuse", severity: "High" },
      { title: "Economic Abuse", severity: "Medium" },
      { title: "Stalking by Partner", severity: "High" }
    ]
  },
  {
    id: "terrorism",
    title: "Terrorism-Related Crimes",
    description: "Acts of terrorism and related offenses",
    icon: Bomb,
    color: "bg-red-100 text-red-600",
    borderColor: "border-red-200",
    crimes: [
      { title: "Terrorist Activities", severity: "Critical" },
      { title: "Terrorist Financing", severity: "Critical" },
      { title: "Terrorist Recruitment", severity: "Critical" },
      { title: "Bomb Threats", severity: "Critical" },
      { title: "Explosive Possession", severity: "Critical" },
      { title: "Terrorist Conspiracy", severity: "Critical" },
      { title: "Waging War Against Nation", severity: "Critical" }
    ]
  },
  {
    id: "missing",
    title: "Missing Persons",
    description: "Cases of missing and abducted individuals",
    icon: UserSearch,
    color: "bg-blue-100 text-blue-600",
    borderColor: "border-blue-200",
    crimes: [
      { title: "Missing Persons", severity: "Critical" },
      { title: "Missing Children", severity: "Critical" },
      { title: "Missing Women", severity: "Critical" },
      { title: "Abduction", severity: "Critical" },
      { title: "Kidnapping for Ransom", severity: "Critical" },
      { title: "Trafficking", severity: "Critical" }
    ]
  },
  {
    id: "immigration",
    title: "Immigration Crimes",
    description: "Offenses related to immigration laws",
    icon: GraduationCap,
    color: "bg-indigo-100 text-indigo-600",
    borderColor: "border-indigo-200",
    crimes: [
      { title: "Illegal Immigration", severity: "High" },
      { title: "Human Trafficking", severity: "Critical" },
      { title: "Smuggling", severity: "High" },
      { title: "Fake Documents", severity: "High" },
      { title: "Visa Fraud", severity: "High" },
      { title: "Border Violations", severity: "Medium" },
      { title: "Unlawful Employment", severity: "Medium" }
    ]
  },
  {
    id: "consumer",
    title: "Consumer Protection Crimes",
    description: "Offenses violating consumer rights and safety",
    icon: ShoppingCart,
    color: "bg-orange-100 text-orange-600",
    borderColor: "border-orange-200",
    crimes: [
      { title: "Adulteration", severity: "High" },
      { title: "Sale of Expired Goods", severity: "Medium" },
      { title: "Counterfeiting", severity: "High" },
      { title: "Price Manipulation", severity: "Medium" },
      { title: "Quality Violations", severity: "High" },
      { title: "False Advertising", severity: "Medium" },
      { title: "Food Adulteration", severity: "Critical" },
      { title: "Medical Device Fraud", severity: "Critical" }
    ]
  },
  {
    id: "education",
    title: "Education-Related Crimes",
    description: "Criminal activities in educational institutions",
    icon: TrendingUp,
    color: "bg-violet-100 text-violet-600",
    borderColor: "border-violet-200",
    crimes: [
      { title: "Ragging", severity: "High" },
      { title: "Bullying in Schools", severity: "Medium" },
      { title: "Sexual Harassment in Campus", severity: "Critical" },
      { title: "Exam Cheating", severity: "Low" },
      { title: "Paper Leaking", severity: "High" },
      { title: "Education Fraud", severity: "High" },
      { title: "Fee Manipulation", severity: "Medium" }
    ]
  },
  {
    id: "general",
    title: "Other Crimes",
    description: "General crime categories and public safety",
    icon: FileWarning,
    color: "bg-zinc-100 text-zinc-600",
    borderColor: "border-zinc-200",
    crimes: [
      { title: "Public Nuisance", severity: "Low" },
      { title: "Noise Pollution", severity: "Low" },
      { title: "Stray Animal Issues", severity: "Low" },
      { title: "Environmental Violations", severity: "Medium" },
      { title: "Uncategorized Offenses", severity: "Medium" }
    ]
  }
];

// Severity badge component
const SeverityBadge = ({ severity }) => {
  const normalizedSeverity = normalizePriority(severity);
  const severityStyle = normalizedSeverity === "critical"
    ? { backgroundColor: "#fee2e2", color: "#b91c1c", borderColor: "#fecaca" }
    : normalizedSeverity === "high"
    ? { backgroundColor: "#ffedd5", color: "#c2410c", borderColor: "#fdba74" }
    : normalizedSeverity === "medium"
    ? { backgroundColor: "#fef9c3", color: "#a16207", borderColor: "#fde68a" }
    : { backgroundColor: "#dcfce7", color: "#15803d", borderColor: "#bbf7d0" };

  return (
    <span
      className="px-2 py-0.5 text-xs font-medium rounded-full border"
      style={severityStyle}
    >
      {severity}
    </span>
  );
};

// Category Card Component
const CategoryCard = ({ category, isExpanded, onToggle, searchQuery }) => {
  const Icon = category.icon;
  
  const filteredCrimes = category.crimes.filter(crime =>
    crime.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${category.borderColor} transition-all duration-300`}
    >
      {/* Category Header */}
      <button 
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${category.color}`}>
            <Icon size={28} />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-gray-800">{category.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">
            {filteredCrimes.length} crimes
          </span>
          {isExpanded ? (
            <ChevronUp className="text-gray-400" />
          ) : (
            <ChevronDown className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              <div className="grid gap-3">
                {filteredCrimes.length > 0 ? (
                  filteredCrimes.map((crime, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gray-400 group-hover:bg-gray-500 transition-colors" />
                        <span className="font-medium text-gray-700">{crime.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <SeverityBadge severity={crime.severity} />
                        <button className="p-2 rounded-lg hover:bg-white shadow-sm transition-all opacity-0 group-hover:opacity-100">
                          <Eye size={18} className="text-gray-500" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No crimes found matching your search
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Main Component
const ViewCrimes = () => {
  const [expandedCategory, setExpandedCategory] = useState("children");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "All" },
    { id: "children", label: "Children" },
    { id: "women", label: "Women" },
    { id: "cyber", label: "Cyber" },
    { id: "violent", label: "Violent" },
    { id: "financial", label: "Financial" },
    { id: "property", label: "Property" },
    { id: "public", label: "Public" },
    { id: "organized", label: "Organized" },
    { id: "elderly", label: "Elderly" },
    { id: "environmental", label: "Environment" },
    { id: "workplace-crimes", label: "Workplace" },
    { id: "drugs", label: "Drugs" },
    { id: "traffic", label: "Traffic" },
    { id: "corruption", label: "Corruption" },
    { id: "hate", label: "Hate" },
    { id: "fraud", label: "Fraud" },
    { id: "animals", label: "Animals" },
    { id: "domestic", label: "Domestic" },
    { id: "terrorism", label: "Terrorism" },
    { id: "missing", label: "Missing" },
    { id: "immigration", label: "Immigration" },
    { id: "consumer", label: "Consumer" },
    { id: "education", label: "Education" },
    { id: "general", label: "Other" }
  ];

  const filteredCategories = activeTab === "all" 
    ? crimeCategories 
    : crimeCategories.filter(cat => cat.id === activeTab);

  const handleToggle = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  // Calculate stats
  const totalCrimes = crimeCategories.reduce((acc, cat) => acc + cat.crimes.length, 0);
  const totalCategories = crimeCategories.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4">
            <Shield className="text-blue-600" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Crime Awareness Portal
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay informed about different types of crimes and learn how to protect yourself and your loved ones. 
            Knowledge is your first line of defense.
          </p>
        </motion.div>

        {/* Search and Actions Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search crimes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-200">
                <Shield size={20} />
                Report Crime
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                <ExternalLink size={20} />
                Resources
              </button>
            </div>
          </div>
        </motion.div>

        {/* Category Tabs - Scrollable */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Category Cards */}
        <div className="grid gap-4">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CategoryCard
                category={category}
                isExpanded={expandedCategory === category.id}
                onToggle={() => handleToggle(category.id)}
                searchQuery={searchQuery}
              />
            </motion.div>
          ))}
        </div>

        {/* Emergency Contact Section */}
        {/* <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Emergency? Need Immediate Help?</h3>
              <p className="text-red-100">
                If you're in immediate danger, contact emergency services right away.
              </p>
            </div>
            <div className="flex gap-4 flex-wrap justify-center">
              <button className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors">
                <AlertTriangle size={20} />
                Call 100 (Police)
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-red-700 text-white rounded-xl font-bold hover:bg-red-800 transition-colors">
                <Heart size={20} />
                Women Helpline
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-red-800 text-white rounded-xl font-bold hover:bg-red-900 transition-colors">
                <Shield size={20} />
                Emergency 112
              </button>
            </div>
          </div>
        </motion.div> */}

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: Shield, label: "Total Categories", value: totalCategories.toString(), color: "bg-blue-100 text-blue-600" },
            { icon: AlertTriangle, label: "Crime Types", value: totalCrimes.toString(), color: "bg-orange-100 text-orange-600" },
          //   { icon: Lock, label: "Safety Tips", value: "50+", color: "bg-green-100 text-green-600" },
          //   { icon: Briefcase, label: "Resources", value: "20+", color: "bg-purple-100 text-purple-600" }
           ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-md">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        {/* <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          <p>© {new Date().getFullYear()} Janrakshak - Your Safety Partner</p>
          <p className="mt-2">Together we can create a safer community. Report suspicious activities immediately.</p>
        </motion.footer> */}
      </div>
    </div>
  );
};

export default ViewCrimes;
