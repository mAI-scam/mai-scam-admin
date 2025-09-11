"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { DashboardData } from "@/data/dummyDynamoDbData";

interface BlacklistProps {
  data: DashboardData | null;
}

const Blacklist: React.FC<BlacklistProps> = ({ data }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Filter high risk website detections and aggregate by URL
  const highRiskWebsites =
    data?.recentDetections.filter(
      (detection) =>
        detection.content_type === "website" && detection.risk_level === "High"
    ) || [];

  // Aggregate websites by URL with count and latest detection date
  const aggregatedWebsites = highRiskWebsites.reduce((acc, detection) => {
    const url = detection.url || detection.domain || "Unknown URL";
    const detectionDate = new Date(detection.created_at);

    if (!acc[url]) {
      acc[url] = {
        url,
        count: 0,
        latestDetection: detectionDate,
      };
    }

    acc[url].count += 1;
    if (detectionDate > acc[url].latestDetection) {
      acc[url].latestDetection = detectionDate;
    }

    return acc;
  }, {} as Record<string, { url: string; count: number; latestDetection: Date }>);

  // Convert to array and sort by count (highest to lowest)
  const sortedWebsites = Object.values(aggregatedWebsites).sort(
    (a, b) => b.count - a.count
  );

  // Filter high risk social media detections with images
  const highRiskSocialMedia =
    data?.recentDetections.filter(
      (detection) =>
        detection.content_type === "socialmedia" &&
        detection.risk_level === "High" &&
        detection.images &&
        detection.images.length > 0
    ) || [];

  // Flatten all images from high risk social media posts
  const allImages = highRiskSocialMedia.flatMap(
    (detection) =>
      detection.images?.map((img) => ({
        ...img,
        detection_id: detection.detection_id,
        platform: detection.platform,
      })) || []
  );

  // Auto-rotate carousel
  useEffect(() => {
    if (allImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [allImages.length]);

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-4">🚫</div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading blacklist data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Left Div - High Risk Website URLs */}
      <div className="w-1/2 h-full flex flex-col border-r border-gray-300 dark:border-gray-600">
        <div className="p-6 border-b border-gray-300 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            High Risk Website URLs
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {sortedWebsites.length} unique websites detected as high risk
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {sortedWebsites.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-2xl mb-2">🌐</div>
              <p className="text-gray-600 dark:text-gray-400">
                No high risk websites detected
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedWebsites.map((website, index) => (
                <div
                  key={website.url}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-red-900 dark:text-red-100">
                        {website.url}
                      </div>
                      <div className="text-sm text-red-700 dark:text-red-300 mt-1">
                        Latest detection:{" "}
                        {website.latestDetection.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end space-y-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        High Risk
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100">
                        {website.count} detection{website.count > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Div - High Risk Social Media Posts Carousel */}
      <div className="w-1/2 h-full flex flex-col">
        <div className="p-6 border-b border-gray-300 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            High Risk Social Media Posts
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {allImages.length} images from {highRiskSocialMedia.length} posts
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 min-h-0">
          {allImages.length === 0 ? (
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-4">📱</div>
              <p className="text-gray-600 dark:text-gray-400">
                No high risk social media images found
              </p>
            </div>
          ) : (
            <div className="relative w-full h-full max-w-sm mx-auto max-h-[70vh]">
              <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={allImages[currentImageIndex]?.s3_url || ""}
                  alt={`High risk social media post ${currentImageIndex + 1}`}
                  width={400}
                  height={400}
                  className="w-full h-full object-contain"
                  onError={() => {
                    console.error(
                      `Failed to load image: ${allImages[currentImageIndex]?.s3_url}`
                    );
                  }}
                />

                {/* Image overlay with detection info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="text-white">
                    <div className="text-sm font-medium">
                      Post {currentImageIndex + 1} of {allImages.length}
                    </div>
                    <div className="text-xs opacity-90 mt-1">
                      Platform:{" "}
                      {allImages[currentImageIndex]?.platform || "Unknown"}
                    </div>
                    <div className="text-xs opacity-90">
                      ID: {allImages[currentImageIndex]?.detection_id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Carousel indicators */}
              <div className="flex justify-center mt-4 space-x-2">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex
                        ? "bg-red-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blacklist;
