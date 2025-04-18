export default function ErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          Authentication Error
        </h1>
        <p className="text-gray-300 mb-6">
          Oops! Something went wrong during the login process. Please try again.
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
