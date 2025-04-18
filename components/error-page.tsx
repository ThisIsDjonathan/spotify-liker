"use client";

export default function ErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-gray-300 mb-6">
          Something went wrong. Please try again later.
        </p>
        <button
          className="spotify-button"
          onClick={() => (window.location.href = "/")}
        >
          Go Back to Login
        </button>
      </div>
    </div>
  );
}
