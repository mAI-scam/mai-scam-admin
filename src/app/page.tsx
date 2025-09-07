"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import SignIn from "@/components/SignIn";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Initializing...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Setting up your admin dashboard
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <SignIn />;
}
