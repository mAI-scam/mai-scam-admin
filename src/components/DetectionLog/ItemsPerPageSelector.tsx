"use client";

import React, { useState, useRef, useEffect } from "react";

interface ItemsPerPageSelectorProps {
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  className?: string;
}

const ItemsPerPageSelector: React.FC<ItemsPerPageSelectorProps> = ({
  itemsPerPage,
  onItemsPerPageChange,
  className = "",
}) => {
  console.log("ItemsPerPageSelector rendered with itemsPerPage:", itemsPerPage);
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const predefinedValues = [20, 50, 100];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsCustomMode(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus input when entering custom mode
  useEffect(() => {
    if (isCustomMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCustomMode]);

  const handlePredefinedValueClick = (value: number) => {
    onItemsPerPageChange(value);
    setIsOpen(false);
    setIsCustomMode(false);
  };

  const handleCustomValueSubmit = () => {
    const numValue = parseInt(customValue);
    if (numValue > 0 && numValue <= 1000) {
      onItemsPerPageChange(numValue);
      setIsOpen(false);
      setIsCustomMode(false);
      setCustomValue("");
    }
  };

  const handleCustomValueKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCustomValueSubmit();
    } else if (e.key === "Escape") {
      setIsCustomMode(false);
      setCustomValue("");
    }
  };

  const handleCustomModeClick = () => {
    setIsCustomMode(true);
    setCustomValue("");
  };

  const isPredefinedValue = predefinedValues.includes(itemsPerPage);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <span>Show {itemsPerPage} per page</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 dark:bg-gray-800 dark:border-gray-600">
          <div className="py-1">
            {/* Predefined values */}
            {predefinedValues.map((value) => (
              <button
                key={value}
                onClick={() => handlePredefinedValueClick(value)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  itemsPerPage === value
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {value} per page
              </button>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-600 my-1" />

            {/* Custom value option */}
            {!isCustomMode ? (
              <button
                onClick={handleCustomModeClick}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Custom value...
              </button>
            ) : (
              <div className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="number"
                    min="1"
                    max="1000"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyDown={handleCustomValueKeyPress}
                    placeholder="Enter number"
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  />
                  <button
                    onClick={handleCustomValueSubmit}
                    disabled={
                      !customValue ||
                      parseInt(customValue) <= 0 ||
                      parseInt(customValue) > 1000
                    }
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Set
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                  Enter 1-1000
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsPerPageSelector;
