// Language and country mapping constants for the Mai Scam Admin Dashboard

// Language abbreviation to full language name mapping
export const LANGUAGE_ABBREVIATIONS: { [key: string]: string } = {
  // Main languages
  en: "English",
  ms: "Malay",
  zh: "Chinese",
  vi: "Vietnamese",
  th: "Thai",
  id: "Indonesian",
  tl: "Filipino",
  my: "Burmese",
  km: "Khmer",
  lo: "Lao",
  ta: "Tamil",
  jv: "Javanese",
  su: "Sundanese",
};

// Language to possible countries mapping
export const LANGUAGE_TO_COUNTRIES: { [key: string]: string[] } = {
  Burmese: ["Myanmar"],
  Chinese: ["Malaysia", "Singapore"],
  English: ["Singapore", "Malaysia", "Philippines"],
  Filipino: ["Philippines"],
  Indonesian: ["Indonesia"],
  Javanese: ["Indonesia"],
  Khmer: ["Cambodia"],
  Lao: ["Laos"],
  Malay: ["Malaysia", "Singapore", "Brunei"],
  Sundanese: ["Indonesia"],
  Tamil: ["Singapore", "Malaysia"],
  Thai: ["Thailand"],
  Vietnamese: ["Vietnam"],
};

// Country information with flags and populations
export const COUNTRY_INFO: {
  [key: string]: { flag: string; population: string };
} = {
  Vietnam: { flag: "🇻🇳", population: "97.3M" },
  Indonesia: { flag: "🇮🇩", population: "273.5M" },
  Thailand: { flag: "🇹🇭", population: "69.8M" },
  Philippines: { flag: "🇵🇭", population: "109.6M" },
  Myanmar: { flag: "🇲🇲", population: "54.4M" },
  Cambodia: { flag: "🇰🇭", population: "16.7M" },
  Laos: { flag: "🇱🇦", population: "7.3M" },
  Malaysia: { flag: "🇲🇾", population: "32.4M" },
  Brunei: { flag: "🇧🇳", population: "0.4M" },
  Singapore: { flag: "🇸🇬", population: "5.9M" },
};

// Helper function to get language display name from abbreviation
export const getLanguageDisplayName = (languageCode: string): string => {
  return LANGUAGE_ABBREVIATIONS[languageCode] || languageCode.toUpperCase();
};

// Helper function to get possible countries for a language
export const getPossibleCountries = (language: string): string[] => {
  return LANGUAGE_TO_COUNTRIES[language] || ["Unknown"];
};

// Helper function to get country information
export const getCountryInfo = (country: string) => {
  return (
    COUNTRY_INFO[country] || {
      flag: "🌐",
      population: "Unknown",
    }
  );
};

// Helper function to get risk level background color
export const getRiskColor = (riskLevel: "High" | "Medium" | "Low") => {
  switch (riskLevel) {
    case "High":
      return "bg-red-100";
    case "Medium":
      return "bg-yellow-100";
    case "Low":
      return "bg-green-100";
    default:
      return "bg-gray-100";
  }
};

// Helper function to get risk level text color
export const getRiskTextColor = (riskLevel: "High" | "Medium" | "Low") => {
  switch (riskLevel) {
    case "High":
      return "text-red-700 bg-red-100";
    case "Medium":
      return "text-yellow-700 bg-yellow-100";
    case "Low":
      return "text-green-700 bg-green-100";
    default:
      return "text-gray-700 bg-gray-100";
  }
};

// Content type mapping for proper display names
export const CONTENT_TYPE_MAPPING: { [key: string]: string } = {
  socialmedia: "Social Media",
  email: "Email",
  website: "Website",
  // Add more mappings as needed
};

// Helper function to get proper content type display name
export const getContentTypeDisplayName = (contentType: string) => {
  return (
    CONTENT_TYPE_MAPPING[contentType.toLowerCase()] ||
    contentType.charAt(0).toUpperCase() + contentType.slice(1)
  );
};
