export default async function AdminDashboard() {
  return (
    <div className="flex flex-col bg-gray-50">
      <div className="flex flex-1">
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-indigo-100 rounded-xl p-6 shadow flex flex-col items-center">
              <span className="text-2xl font-bold text-indigo-700">
                User Management
              </span>
              <p className="text-gray-500 mt-2 text-center">
                Add, update, or remove students and teachers. Import/export data.
              </p>
            </div>
            <div className="bg-indigo-100 rounded-xl p-6 shadow flex flex-col items-center">
              <span className="text-2xl font-bold text-indigo-700">
                Course Management
              </span>
              <p className="text-gray-500 mt-2 text-center">
                Manage courses, assign to departments, set credits and grading
                policies.
              </p>
            </div>
            <div className="bg-indigo-100 rounded-xl p-6 shadow flex flex-col items-center">
              <span className="text-2xl font-bold text-indigo-700">
                Result Publishing
              </span>
              <p className="text-gray-500 mt-2 text-center">
                Publish results, send notifications, and generate analytics.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow">
              <h2 className="text-xl font-semibold text-indigo-700 mb-2">
                Quick Actions
              </h2>
              <ul className="list-disc ml-5 text-gray-600 space-y-1">
                <li>Add new student/teacher</li>
                <li>Import students (CSV/Excel)</li>
                <li>Assign courses to teachers</li>
                <li>Publish semester results</li>
              </ul>
            </div>
            <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow">
              <h2 className="text-xl font-semibold text-indigo-700 mb-2">
                System Analytics
              </h2>
              <ul className="list-disc ml-5 text-gray-600 space-y-1">
                <li>Department-wise result summary</li>
                <li>Top performers list</li>
                <li>Recent activity overview</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
