import React, { useState } from "react";
import Image from "next/image";
import { ScamDetection } from "@/data/dummyDynamoDbData";
import { getContentTypeDisplayName } from "@/data/constants";

interface DetailCardProps {
  detection: ScamDetection;
  title: string;
  children?: React.ReactNode;
}

const DetailCard: React.FC<DetailCardProps> = ({
  detection,
  title,
  children,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <div className="space-y-2 text-sm">
        {/* Type - always first */}
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Type</span>
          <span className="text-gray-900 dark:text-white">
            {getContentTypeDisplayName(detection.content_type)}
          </span>
        </div>

        {/* Detected Language - always second */}
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">
            Detected Language
          </span>
          <span className="text-gray-900 dark:text-white">
            {detection.detected_language === "ms"
              ? "Malay"
              : detection.detected_language === "zh"
              ? "Chinese"
              : detection.detected_language === "en"
              ? "English"
              : detection.detected_language || "unknown"}
          </span>
        </div>

        {/* Website specific: URL */}
        {detection.content_type === "website" && (
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">URL</span>
            <a
              href={detection.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline break-all text-right max-w-[200px]"
            >
              {detection.url || "N/A"}
            </a>
          </div>
        )}

        {/* Social Media specific: Platform */}
        {detection.content_type === "socialmedia" && (
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Platform</span>
            <span className="text-gray-900 dark:text-white">
              {detection.platform || "Unknown"}
            </span>
          </div>
        )}

        {/* Social Media specific: Post Images */}
        {detection.content_type === "socialmedia" && detection.images && detection.images.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-900 dark:text-white mb-2">
              Post Images
            </h4>
            <div className="max-h-[60vh] overflow-y-auto grid grid-cols-1 gap-2">
              {detection.images.map((img, index) => (
                <div key={index} className="relative">
                  <Image
                    src={img.s3_url}
                    alt={`Post image ${index + 1}`}
                    width={400}
                    height={300}
                    className="w-full h-auto max-h-[40vh] object-contain rounded border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(img.s3_url)}
                    onError={() => {
                      console.error(`Failed to load image: ${img.s3_url}`);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email specific: Privacy Notice */}
        {detection.content_type === "email" && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-medium">Privacy Notice:</span> Due to
              privacy concerns, details of the original email are not stored.
            </p>
          </div>
        )}
      </div>

      {children}

      {/* Full-size Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={selectedImage}
              alt="Full size image"
              width={800}
              height={600}
              className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailCard;
