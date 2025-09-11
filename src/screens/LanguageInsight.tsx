"use client";

import React, { useEffect, useState } from "react";
import { getPossibleCountries } from "@/data/constants";
import LanguageCard from "@/components/LanguageInsight/LanguageCard";
import LanguageDetailCard from "@/components/LanguageInsight/LanguageDetailCard";

interface LanguageData {
  language: string;
  count: number;
  percentage: number;
  riskLevel: "High" | "Medium" | "Low";
  possibleCountries: string[];
}

interface CountryDetails {
  name: string;
  language: string;
  detections: number;
  percentage: number;
  riskLevel: "High" | "Medium" | "Low";
  possibleCountries: string[];
  contentTypes: { type: string; count: number }[];
  riskDistribution: { level: "Low" | "Medium" | "High"; count: number }[];
}

const LanguageInsight: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [languageData, setLanguageData] = useState<LanguageData[]>([]);
  const [originalLanguageInsights, setOriginalLanguageInsights] = useState<
    any[]
  >([]);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageData | null>(
    null
  );
  const [countryDetails, setCountryDetails] = useState<CountryDetails | null>(
    null
  );

  // Generate risk distribution data (mock data for now)
  const generateRiskDistribution = (
    totalDetections: number,
    riskLevel: "High" | "Medium" | "Low"
  ) => {
    const distributions = {
      High: [
        { level: "Low" as const, count: Math.floor(totalDetections * 0.2) },
        { level: "Medium" as const, count: Math.floor(totalDetections * 0.3) },
        { level: "High" as const, count: Math.floor(totalDetections * 0.5) },
      ],
      Medium: [
        { level: "Low" as const, count: Math.floor(totalDetections * 0.4) },
        { level: "Medium" as const, count: Math.floor(totalDetections * 0.5) },
        { level: "High" as const, count: Math.floor(totalDetections * 0.1) },
      ],
      Low: [
        { level: "Low" as const, count: Math.floor(totalDetections * 0.6) },
        { level: "Medium" as const, count: Math.floor(totalDetections * 0.3) },
        { level: "High" as const, count: Math.floor(totalDetections * 0.1) },
      ],
    };
    return distributions[riskLevel];
  };

  useEffect(() => {
    const loadLanguageData = async () => {
      try {
        console.log("📊 Loading language scam data from DynamoDB...");

        // Fetch processed dashboard data from API
        const response = await fetch("/api/dashboard");
        const result = await response.json();

        console.log("✅ Dashboard API response:", result);

        if (!result.success || !result.data) {
          console.error(
            "❌ API request failed:",
            result.error || result.message
          );
          setIsLoading(false);
          return;
        }

        const dashboardData = result.data;
        console.log("📈 Dashboard data loaded:", dashboardData);

        // Use the pre-processed language insights from the API
        const languageInsights = dashboardData.languageInsights || [];
        console.log("🔍 Language insights from API:", languageInsights);

        // Store original insights for content type access
        setOriginalLanguageInsights(languageInsights);

        // Convert to our format with country mapping
        const totalDetections = languageInsights.reduce(
          (sum: number, insight: any) => sum + insight.detections,
          0
        );

        const processedLanguageData: LanguageData[] = languageInsights.map(
          (insight: any) => {
            const percentage = (insight.detections / totalDetections) * 100;

            let riskLevel: "High" | "Medium" | "Low" = "Low";
            if (percentage >= 30) riskLevel = "High";
            else if (percentage >= 15) riskLevel = "Medium";

            return {
              language: insight.language,
              count: insight.detections,
              percentage: Math.round(percentage * 10) / 10,
              riskLevel,
              possibleCountries: getPossibleCountries(insight.language),
            };
          }
        );

        console.log("📈 Language data processed:", processedLanguageData);

        setLanguageData(processedLanguageData);

        // Set the language with most detections as default active
        if (processedLanguageData.length > 0) {
          setSelectedLanguage(processedLanguageData[0]);
          setCountryDetails({
            name: processedLanguageData[0].possibleCountries[0],
            language: processedLanguageData[0].language,
            detections: processedLanguageData[0].count,
            percentage: processedLanguageData[0].percentage,
            riskLevel: processedLanguageData[0].riskLevel,
            possibleCountries: processedLanguageData[0].possibleCountries,
            contentTypes:
              languageInsights.find(
                (insight: any) =>
                  insight.language === processedLanguageData[0].language
              )?.topContentTypes || [],
            riskDistribution: generateRiskDistribution(
              processedLanguageData[0].count,
              processedLanguageData[0].riskLevel
            ),
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error loading language data:", error);
        setIsLoading(false);
      }
    };

    loadLanguageData();
  }, []);

  const handleLanguageClick = (language: LanguageData) => {
    setSelectedLanguage(language);

    // Find the original insight data for content types
    const originalInsight = originalLanguageInsights.find(
      (insight: any) => insight.language === language.language
    );

    setCountryDetails({
      name: language.possibleCountries[0],
      language: language.language,
      detections: language.count,
      percentage: language.percentage,
      riskLevel: language.riskLevel,
      possibleCountries: language.possibleCountries,
      contentTypes: originalInsight?.topContentTypes || [],
      riskDistribution: generateRiskDistribution(
        language.count,
        language.riskLevel
      ),
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading language insights...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex gap-6 h-full min-h-0 max-h-full">
        {/* Left Column - Language Cards */}
        <div className="flex-1 flex flex-col h-full min-h-0 max-h-full">
          <div className="h-full space-y-3 overflow-y-auto pr-2 scrollbar-thin">
            {languageData.map((lang, index) => (
              <LanguageCard
                key={lang.language}
                language={lang}
                isSelected={selectedLanguage?.language === lang.language}
                onClick={handleLanguageClick}
              />
            ))}
          </div>
        </div>

        {/* Right Column - Language Details */}
        <LanguageDetailCard countryDetails={countryDetails} />
      </div>
    </div>
  );
};

export default LanguageInsight;
