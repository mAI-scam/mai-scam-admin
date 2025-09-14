"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

const SignIn: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState<"test" | "google">("test");
  const { testLogin, googleLogin, isLoading } = useAuth();

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    const result = await testLogin(username, password);
    if (!result.success) {
      setError(result.error || "Login failed");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    const result = await googleLogin();
    if (!result.success) {
      setError(result.error || "Google authentication failed");
    }
  };

  const fillTestCredentials = () => {
    setUsername("test");
    setPassword("1234");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 px-4 overflow-hidden">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="mAIscam Logo"
              width={48}
              height={48}
              className="mr-3"
            />
            <div className="flex items-center">
              <span className="text-3xl font-bold">
                <span style={{ color: "#49A4EF" }}>m</span>
                <span style={{ color: "#EB6700" }}>AI</span>
                <span style={{ color: "#49A4EF" }}>scam</span>
              </span>
              <span
                className="text-2xl font-extrabold ml-4"
                style={{ color: "#49A4EF" }}
              >
                Admin Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-gray-800 py-6 px-6 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 min-h-[400px] flex flex-col">
          {/* Mode Selector */}
          <div className="mb-5">
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("test");
                  setError("");
                }}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  authMode === "test"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                🧪 Test Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("google");
                  setError("");
                }}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  authMode === "google"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                🔐 Google Auth
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            </div>
          )}

          {/* Test Login Form */}
          {authMode === "test" ? (
            <div className="flex-1 flex flex-col space-y-5">
              <form
                onSubmit={handleTestSubmit}
                className="flex-1 flex flex-col space-y-4"
              >
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Enter password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ backgroundColor: "#49A4EF" }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLButtonElement).style.backgroundColor =
                      "#3B82F6")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLButtonElement).style.backgroundColor =
                      "#49A4EF")
                  }
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🔑</span>
                      Sign in with Test Account
                    </>
                  )}
                </button>
              </form>

              {/* Test Credentials Helper */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                <button
                  type="button"
                  onClick={fillTestCredentials}
                  className="w-full text-center text-sm font-medium py-2 px-3 rounded transition-colors"
                  style={{
                    backgroundColor: "#F0F8FF",
                    color: "#49A4EF",
                    border: "1px solid #49A4EF",
                  }}
                >
                  ✨ Autofill test credentials
                </button>
              </div>
            </div>
          ) : (
            /* Google Login */
            <div className="flex-1 flex flex-col space-y-5">
              <div className="text-center flex-1 flex flex-col justify-center">
                <div className="mb-3">
                  <div className="mx-auto w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Sign in with your Google account to access real-time data from
                  AWS DynamoDB
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                      Connecting to Google...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  🔒 Secure authentication via Supabase • 📊 Real data from AWS
                  DynamoDB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          <p>© 2024 Mai Scam Admin Dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
