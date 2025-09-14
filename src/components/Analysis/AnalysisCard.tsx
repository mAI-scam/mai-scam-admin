import React from "react";
import { ScamDetection } from "@/data/dummyDynamoDbData";

interface AnalysisCardProps {
  detection: ScamDetection;
  title: string;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ detection, title }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col w-full lg:w-1/2">
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
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

      <div className="space-y-4 flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
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

        {/* Website specific: Legitimate URL */}
        {detection.content_type === "website" && detection.legitimate_url && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Legitimate URL
            </h3>
            <a
              href={detection.legitimate_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {detection.legitimate_url}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisCard;
