import React from "react";
import { ScamDetection } from "@/data/dummyDynamoDbData";

interface AnalysisCardProps {
  detection: ScamDetection;
  title: string;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ detection, title }) => {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Detection ID: {detection.detection_id} • Recorded{" "}
            {new Date(detection.created_at).toLocaleString()}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            detection.risk_level === "High"
              ? "bg-red-100 text-red-800"
              : detection.risk_level === "Medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {detection.risk_level}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            Analysis
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {detection.analysis}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            Recommended Action
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {detection.recommended_action}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCard;
