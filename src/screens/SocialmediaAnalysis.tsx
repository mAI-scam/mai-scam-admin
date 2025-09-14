"use client";

import React from "react";
import { ScamDetection } from "@/data/dummyDynamoDbData";
import ModelAttribution from "@/components/Analysis/ModelAttribution";
import DetailCard from "@/components/Analysis/DetailCard";
import AnalysisCard from "@/components/Analysis/AnalysisCard";

interface SocialmediaAnalysisProps {
  detection: ScamDetection;
  onBack: () => void;
  backButtonText?: string;
}

const SocialmediaAnalysis: React.FC<SocialmediaAnalysisProps> = ({
  detection,
  onBack,
  backButtonText = "Back to Detection Log",
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {backButtonText}
        </button>
        <ModelAttribution />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AnalysisCard detection={detection} title="Social Media Analysis" />
        <DetailCard detection={detection} title="Post Details" />
      </div>
    </div>
  );
};

export default SocialmediaAnalysis;
