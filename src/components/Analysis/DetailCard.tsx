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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col w-full lg:w-1/2">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex-shrink-0">
        {title}
      </h3>
      <div className="space-y-2 text-sm flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
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

        {/* Website specific: Title */}
        {detection.content_type === "website" && (
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 mb-1">Title</span>
            <div className="text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              {detection.title || "No title available"}
            </div>
          </div>
        )}

        {/* Website specific: URL */}
        {detection.content_type === "website" && (
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 mb-1">URL</span>
            <a
              href={detection.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {detection.url || "N/A"}
            </a>
          </div>
        )}

        {/* Website specific: Description */}
        {detection.content_type === "website" &&
          detection.extracted_data?.metadata?.description && (
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 mb-1">
                Description
              </span>
              <div className="text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                {detection.extracted_data.metadata.description}
              </div>
            </div>
          )}

        {/* Website specific: Content (truncated) */}
        {detection.content_type === "website" && detection.content && (
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 mb-1">
              Content (truncated)
            </span>
            <div className="text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              {detection.content.length > 500
                ? `${detection.content.substring(0, 500)}...`
                : detection.content}
            </div>
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

        {/* Social Media specific: Post URL */}
        {detection.content_type === "socialmedia" && detection.post_url && (
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Post URL</span>
            <a
              href={detection.post_url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline break-all text-right max-w-[200px]"
            >
              View Post
            </a>
          </div>
        )}

        {/* Social Media specific: Author Username */}
        {detection.content_type === "socialmedia" &&
          detection.author_username && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Author</span>
              <span className="text-gray-900 dark:text-white">
                {detection.author_username}
              </span>
            </div>
          )}

        {/* Social Media specific: Follower Count */}
        {detection.content_type === "socialmedia" &&
          detection.author_followers_count !== null &&
          detection.author_followers_count !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Followers
              </span>
              <span className="text-gray-900 dark:text-white">
                {detection.author_followers_count.toLocaleString()}
              </span>
            </div>
          )}

        {/* Social Media specific: Caption/Content */}
        {detection.content_type === "socialmedia" && (
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 mb-1">
              Caption
            </span>
            <div className="text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-h-32 overflow-y-auto">
              {(() => {
                console.log("Detection object:", detection);
                console.log("Content field:", detection.content);
                console.log("Content type:", typeof detection.content);
                return detection.content || "No caption available";
              })()}
            </div>
          </div>
        )}

        {/* Social Media specific: Hashtags */}
        {detection.content_type === "socialmedia" &&
          detection.extracted_data?.signals?.artifacts?.hashtags &&
          detection.extracted_data.signals.artifacts.hashtags.length > 0 && (
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 mb-1">
                Hashtags
              </span>
              <div className="flex flex-wrap gap-1">
                {detection.extracted_data.signals.artifacts.hashtags.map(
                  (hashtag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {hashtag}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

        {/* Social Media specific: Engagement Metrics */}
        {detection.content_type === "socialmedia" &&
          detection.extracted_data?.signals?.engagement_metrics && (
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 mb-2">
                Engagement Metrics
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.818a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Likes
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(
                      detection.extracted_data.signals.engagement_metrics
                        .likes ?? 0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Comments
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(
                      detection.extracted_data.signals.engagement_metrics
                        .comments ?? 0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4 text-purple-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Shares
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(
                      detection.extracted_data.signals.engagement_metrics
                        .shares ?? 0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <div className="flex items-center space-x-1">
                    <span className="w-4 h-4 flex items-center justify-center text-sm">
                      😂
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Reactions
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(
                      detection.extracted_data.signals.engagement_metrics
                        .reactions ?? 0
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* Social Media specific: Post Image */}
        {detection.content_type === "socialmedia" &&
          detection.extracted_data?.images &&
          detection.extracted_data.images.length > 0 && (
            <div>
              <span className="text-gray-500 dark:text-gray-400 mb-2">
                Post Image
              </span>
              <div className="grid grid-cols-1 gap-2">
                {detection.extracted_data.images.map((img, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={img.s3_url}
                      alt={`Post image ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-auto max-h-96 object-contain rounded border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
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
