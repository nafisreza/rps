"use client";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function getCourseType(code: string) {
  // Extract prefix before first space or digit
  const match = code.match(/^[A-Za-z]+/);
  return match ? match[0] : "Other";
}

export default function CourseTypePerformance({ semesters }: { semesters: any[] }) {
  // Aggregate performance by course type
  const typeStats: Record<string, { total: number; count: number }> = {};
  semesters.forEach((s: any) => {
    s.courses.forEach((c: any) => {
      const type = getCourseType(c.code);
      if (!typeStats[type]) typeStats[type] = { total: 0, count: 0 };
   typeStats[type].total += typeof c.gpa === "number" ? c.gpa : (typeof c.gradePoint === "number" ? c.gradePoint : 0);
      typeStats[type].count += 1;
    });
  });
  const types = Object.keys(typeStats);
  const avgGpas = types.map((t) => typeStats[t].count ? typeStats[t].total / typeStats[t].count : 0);

  // Find best and worst types
  let bestType = "", worstType = "";
  let bestGpa = -1, worstGpa = 5;
  types.forEach((t, i) => {
    if (avgGpas[i] > bestGpa) { bestGpa = avgGpas[i]; bestType = t; }
    if (avgGpas[i] < worstGpa) { worstGpa = avgGpas[i]; worstType = t; }
  });

  // Comment logic
  let comment = "";
  if (bestType && worstType && bestType !== worstType) {
    comment = `You are strong in ${bestType} courses, but you should give more effort on ${worstType} courses.`;
  } else if (bestType) {
    comment = `You are strong in ${bestType} courses.`;
  } else {
    comment = "No course type performance data available.";
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-lg font-semibold mb-4 text-blue-900">Course Type Performance</h2>
      <Bar
        data={{
          labels: types,
          datasets: [
            {
              label: "Average GPA",
              data: avgGpas,
              backgroundColor: "#2563eb",
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: false },
          },
          scales: { y: { beginAtZero: true, max: 4 } },
        }}
      />
      <div className="mt-4 text-base font-medium text-gray-700 text-center">
        Comment: {comment}
      </div>
    </div>
  );
}
