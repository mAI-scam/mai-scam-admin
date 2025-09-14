"use client";

import React from "react";
import {
  getCountryInfo,
  getRiskColor,
  getRiskTextColor,
} from "@/data/constants";

interface LanguageData {
  language: string;
  count: number;
  percentage: number;
  riskLevel: "High" | "Medium" | "Low";
  possibleCountries: string[];
}

interface LanguageCardProps {
  language: LanguageData;
  isSelected: boolean;
  onClick: (language: LanguageData) => void;
}

const LanguageCard: React.FC<LanguageCardProps> = ({
  language,
  isSelected,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick(language)}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${getRiskColor(
              language.riskLevel
            )}`}
          ></div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {language.language}
          </h3>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskTextColor(
            language.riskLevel
          )}`}
        >
          {language.riskLevel}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>{language.count} detections</span>
        <span>{language.percentage}% of total</span>
      </div>
    </div>
  );
};

export default LanguageCard;
