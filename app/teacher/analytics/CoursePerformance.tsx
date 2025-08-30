export default function CoursePerformance({ analytics }: { analytics: any }) {
  return (
    <section className="p-6 mt-8">
      <h2 className="text-xl text-center font-semibold mb-6 text-blue-900">Performance Overview</h2>
      <div className="flex flex-row gap-6 mb-6">
        <div className="bg-blue-100 rounded p-4 text-center px-24 py-8">
          <div className="text-sm text-gray-500 mb-1">Average Marks</div>
          <div className="text-3xl font-bold text-blue-700">{analytics.avgMarks}</div>
        </div>
        <div className="bg-green-100 rounded p-4 text-center px-24 py-8">
          <div className="text-sm text-gray-500 mb-1">Pass Rate</div>
          <div className="text-3xl font-bold text-green-700">{analytics.passRate}%</div>
        </div>
        <div className="bg-red-100 rounded p-4 text-center px-24 py-8">
          <div className="text-sm text-gray-500 mb-1">Fail Rate</div>
          <div className="text-3xl font-bold text-red-700">{analytics.failRate}%</div>
        </div>
      </div>
    </section>
  );
}
