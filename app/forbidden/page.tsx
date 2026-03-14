export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-8xl font-black text-gray-200 mb-4">403</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-8">You don&apos;t have permission to view this page.</p>
        <a href="/dashboard" className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}