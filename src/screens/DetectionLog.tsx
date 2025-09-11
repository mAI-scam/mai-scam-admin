"use client";

import React, { useState } from "react";
import { DashboardData } from "@/data/dummyDynamoDbData";
import DetectionTable from "@/components/DetectionLog/table";

interface SectionProps {
  data: DashboardData;
  authType: "test" | "google";
  isRefreshing?: boolean;
}

interface DetectionLogProps extends SectionProps {
  typeFilters: { website: boolean; email: boolean; socialmedia: boolean };
  setTypeFilters: React.Dispatch<
    React.SetStateAction<{
      website: boolean;
      email: boolean;
      socialmedia: boolean;
    }>
  >;
  riskFilters: { high: boolean; medium: boolean; low: boolean };
  setRiskFilters: React.Dispatch<
    React.SetStateAction<{ high: boolean; medium: boolean; low: boolean }>
  >;
  languageFilters: { [key: string]: boolean };
  setLanguageFilters: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  pageInput: string;
  setPageInput: React.Dispatch<React.SetStateAction<string>>;
  itemsPerPage: number;
  getLanguageDisplayName: (languageCode: string) => string;
  onOpenAnalysis?: (detection: any) => void;
}

const DetectionLog: React.FC<DetectionLogProps> = ({
  data,
  typeFilters,
  setTypeFilters,
  riskFilters,
  setRiskFilters,
  languageFilters,
  setLanguageFilters,
  currentPage,
  setCurrentPage,
  pageInput,
  setPageInput,
  itemsPerPage,
  getLanguageDisplayName,
  onOpenAnalysis,
}) => {
  return (
    <div className="h-full flex flex-col">
      <DetectionTable
        data={data}
        typeFilters={typeFilters}
        setTypeFilters={setTypeFilters}
        riskFilters={riskFilters}
        setRiskFilters={setRiskFilters}
        languageFilters={languageFilters}
        setLanguageFilters={setLanguageFilters}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageInput={pageInput}
        setPageInput={setPageInput}
        itemsPerPage={itemsPerPage}
        getLanguageDisplayName={getLanguageDisplayName}
        onRowClick={onOpenAnalysis}
      />
    </div>
  );
};

export default DetectionLog;
