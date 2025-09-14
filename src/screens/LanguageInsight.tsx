"use client";

import React, { useEffect, useState } from "react";
import { getPossibleCountries } from "@/data/constants";
import { LanguageInsight as ApiLanguageInsight } from "@/data/dummyDynamoDbData";
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

interface ProcessedLanguageInsight {
  language: string;
  detections: number;
  percentage: number;
  riskLevel: "High" | "Medium" | "Low";
  possibleCountries: string[];
  riskDistribution?: { level: "Low" | "Medium" | "High"; count: number }[];
  topContentTypes?: { type: string; count: number }[];
}

interface LanguageInsightProps {
  processedLanguageInsights?: ProcessedLanguageInsight[] | null;
}

const LanguageInsight: React.FC<LanguageInsightProps> = ({
  processedLanguageInsights,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [languageData, setLanguageData] = useState<LanguageData[]>([]);
  const [originalLanguageInsights, setOriginalLanguageInsights] = useState<
    ApiLanguageInsight[]
  >([]);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageData | null>(
    null
  );
  const [countryDetails, setCountryDetails] = useState<CountryDetails | null>(
    null
  );
  const [sortBy, setSortBy] = useState<"detections" | "risk">("detections");

  // Sort language data based on current sort option
  const sortedLanguageData = React.useMemo(() => {
    if (!languageData.length) return languageData;

    return [...languageData].sort((a, b) => {
      if (sortBy === "detections") {
        return b.count - a.count; // Sort by detection count (descending)
      } else {
        // Sort by risk level (High > Medium > Low)
        const riskOrder = { High: 3, Medium: 2, Low: 1 };
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      }
    });
  }, [languageData, sortBy]);

  // Calculate maximum risk distribution value across all languages for consistent y-axis scaling
  const maxRiskDistributionValue = React.useMemo(() => {
    if (!originalLanguageInsights.length) return 100; // Default fallback

    let maxValue = 0;
    originalLanguageInsights.forEach((insight) => {
      if (insight.riskDistribution) {
        insight.riskDistribution.forEach((dist) => {
          if (dist.count > maxValue) {
            maxValue = dist.count;
          }
        });
      }
    });

    // Round up to nearest 10 for cleaner tick marks
    return Math.ceil(maxValue / 10) * 10 || 100;
  }, [originalLanguageInsights]);

  // Calculate language risk level based on actual risk distribution
  const calculateLanguageRiskLevel = (
    insight: ApiLanguageInsight
  ): "High" | "Medium" | "Low" => {
    const distribution = insight.riskDistribution || [
      { level: "Low" as const, count: 0 },
      { level: "Medium" as const, count: 0 },
      { level: "High" as const, count: 0 },
    ];

    const totalDetections = insight.detections;
    if (totalDetections === 0) return "Low";

    // Get counts for each risk level
    const lowCount = distribution.find((d) => d.level === "Low")?.count || 0;
    const mediumCount =
      distribution.find((d) => d.level === "Medium")?.count || 0;
    const highCount = distribution.find((d) => d.level === "High")?.count || 0;

    // Calculate percentages
    const lowPercentage = (lowCount / totalDetections) * 100;
    const mediumPercentage = (mediumCount / totalDetections) * 100;
    const highPercentage = (highCount / totalDetections) * 100;

    // Calculate weighted risk score (High=3, Medium=2, Low=1)
    const weightedScore =
      (highCount * 3 + mediumCount * 2 + lowCount * 1) / totalDetections;

    console.log(`🎯 Risk Assessment for ${insight.language}:`, {
      totalDetections,
      distribution: { lowCount, mediumCount, highCount },
      percentages: { lowPercentage, mediumPercentage, highPercentage },
      weightedScore,
    });

    // Risk level determination based on multiple factors:
    // 1. If >50% are High risk detections → High
    // 2. If >30% are High risk OR weighted score >2.2 → High
    // 3. If >40% are Medium+High risk OR weighted score >1.8 → Medium
    // 4. Otherwise → Low

    if (highPercentage > 50) {
      return "High";
    } else if (highPercentage > 30 || weightedScore > 2.2) {
      return "High";
    } else if (mediumPercentage + highPercentage > 40 || weightedScore > 1.8) {
      return "Medium";
    } else {
      return "Low";
    }
  };

  // Get actual risk distribution data from the language insight
  const getRiskDistribution = (languageInsight: ApiLanguageInsight) => {
    const distribution = languageInsight.riskDistribution || [
      { level: "Low" as const, count: 0 },
      { level: "Medium" as const, count: 0 },
      { level: "High" as const, count: 0 },
    ];

    // Debug: Log the risk distribution to verify it matches total detections
    const totalFromDistribution = distribution.reduce(
      (sum, item) => sum + item.count,
      0
    );
    console.log(`🔍 Risk Distribution for ${languageInsight.language}:`, {
      distribution,
      totalFromDistribution,
      totalDetections: languageInsight.detections,
      matches: totalFromDistribution === languageInsight.detections,
    });

    return distribution;
  };

  useEffect(() => {
    const loadLanguageData = async () => {
      try {
        // If we have pre-calculated data, use it directly
        if (processedLanguageInsights && processedLanguageInsights.length > 0) {
          console.log("📊 Using pre-calculated language insights");

          // Store original insights for content type access
          setOriginalLanguageInsights(
            processedLanguageInsights as unknown as ApiLanguageInsight[]
          );

          // Convert to our format
          const processedLanguageData: LanguageData[] =
            processedLanguageInsights.map(
              (insight: ProcessedLanguageInsight) => ({
                language: insight.language,
                count: insight.detections,
                percentage: insight.percentage,
                riskLevel: insight.riskLevel,
                possibleCountries: insight.possibleCountries,
              })
            );

          console.log(
            "📈 Language data from pre-calculated insights:",
            processedLanguageData
          );

          setLanguageData(processedLanguageData);

          // Set the language with most detections as default active
          if (processedLanguageData.length > 0) {
            setSelectedLanguage(processedLanguageData[0]);
            const firstLanguageInsight = processedLanguageInsights.find(
              (insight: ProcessedLanguageInsight) =>
                insight.language === processedLanguageData[0].language
            ) as ApiLanguageInsight | undefined;
            setCountryDetails({
              name: processedLanguageData[0].possibleCountries[0],
              language: processedLanguageData[0].language,
              detections: processedLanguageData[0].count,
              percentage: processedLanguageData[0].percentage,
              riskLevel: processedLanguageData[0].riskLevel,
              possibleCountries: processedLanguageData[0].possibleCountries,
              contentTypes: firstLanguageInsight?.topContentTypes || [],
              riskDistribution: firstLanguageInsight
                ? getRiskDistribution(firstLanguageInsight)
                : [
                    { level: "Low" as const, count: 0 },
                    { level: "Medium" as const, count: 0 },
                    { level: "High" as const, count: 0 },
                  ],
            });
          }

          setIsLoading(false);
          return;
        }

        // Fallback to original API call if no pre-calculated data
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
          (sum: number, insight: ApiLanguageInsight) =>
            sum + insight.detections,
          0
        );

        const processedLanguageData: LanguageData[] = languageInsights.map(
          (insight: ApiLanguageInsight) => {
            const percentage = (insight.detections / totalDetections) * 100;

            // Calculate risk level based on actual risk distribution within the language
            const riskLevel = calculateLanguageRiskLevel(insight);

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
          const firstLanguageInsight = languageInsights.find(
            (insight: ApiLanguageInsight) =>
              insight.language === processedLanguageData[0].language
          );
          setCountryDetails({
            name: processedLanguageData[0].possibleCountries[0],
            language: processedLanguageData[0].language,
            detections: processedLanguageData[0].count,
            percentage: processedLanguageData[0].percentage,
            riskLevel: processedLanguageData[0].riskLevel,
            possibleCountries: processedLanguageData[0].possibleCountries,
            contentTypes: firstLanguageInsight?.topContentTypes || [],
            riskDistribution: firstLanguageInsight
              ? getRiskDistribution(firstLanguageInsight)
              : [
                  { level: "Low" as const, count: 0 },
                  { level: "Medium" as const, count: 0 },
                  { level: "High" as const, count: 0 },
                ],
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error loading language data:", error);
        setIsLoading(false);
      }
    };

    loadLanguageData();
  }, [processedLanguageInsights]);

  const handleLanguageClick = (language: LanguageData) => {
    setSelectedLanguage(language);

    // Find the original insight data for content types and risk distribution
    const originalInsight = originalLanguageInsights.find(
      (insight: ApiLanguageInsight) => insight.language === language.language
    );

    setCountryDetails({
      name: language.possibleCountries[0],
      language: language.language,
      detections: language.count,
      percentage: language.percentage,
      riskLevel: language.riskLevel,
      possibleCountries: language.possibleCountries,
      contentTypes: originalInsight?.topContentTypes || [],
      riskDistribution: originalInsight
        ? getRiskDistribution(originalInsight)
        : [
            { level: "Low" as const, count: 0 },
            { level: "Medium" as const, count: 0 },
            { level: "High" as const, count: 0 },
          ],
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
      <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full min-h-0 max-h-full">
        {/* Left Column - Language Cards */}
        <div className="flex-1 flex flex-col h-full min-h-0 max-h-full">
          {/* Sorting Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <button
              onClick={() => setSortBy("detections")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                sortBy === "detections"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Sort by Detections
            </button>
            <button
              onClick={() => setSortBy("risk")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                sortBy === "risk"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Sort by Risk
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-thin">
            {sortedLanguageData.map((lang) => (
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
        <LanguageDetailCard
          countryDetails={countryDetails}
          maxRiskDistributionValue={maxRiskDistributionValue}
        />
      </div>
    </div>
  );
};

export default LanguageInsight;
