export default function StudentProgress({ analytics }: { analytics: any }) {
  return (
    <section className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-blue-900">
        Progress Tracking
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2 text-green-700">Top Performers</h3>
          {analytics.topPerformers.length ? (
            <ul className="text-sm text-green-700">
              {analytics.topPerformers.map((student: any) => (
                <li key={student.id}>
                  {student.name} ({student.id}) - GPA: {student.gpa}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">None</div>
          )}
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-red-700">Students At Risk</h3>
          {analytics.studentsAtRisk.length ? (
            <ul className="text-sm text-red-700">
              {analytics.studentsAtRisk.map((student: any) => (
                <li key={student.id}>
                  {student.name} ({student.id}) - GPA: {student.gpa}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">None</div>
          )}
        </div>
      </div>
    </section>
  );
}
