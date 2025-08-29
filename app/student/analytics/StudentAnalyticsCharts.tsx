"use client";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

export default function StudentAnalyticsCharts({ semesters }: { semesters: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-lg font-semibold mb-4 text-blue-900">GPA Trend</h2>
        <Line
          data={{
            labels: semesters.map((s: any) => `Semester ${s.semester}`),
            datasets: [
              {
                label: "Semester GPA",
                data: semesters.map((s: any) => s.gpa ?? 0),
                borderColor: "#2563eb",
                backgroundColor: "rgba(37,99,235,0.1)",
                tension: 0.3,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: { beginAtZero: true, max: 4 },
            },
          }}
        />
      </div>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-4 text-blue-900">Grade Distribution</h2>
        <div style={{ maxWidth: 300, maxHeight: 300 }}>
          <Pie
            data={{
              labels: Object.keys(
                semesters.reduce((acc: any, s: any) => {
                  s.courses.forEach((c: any) => {
                    acc[c.grade] = (acc[c.grade] || 0) + 1;
                  });
                  return acc;
                }, {})
              ),
              datasets: [
                {
                  label: "Grades",
                  data: Object.values(
                    semesters.reduce((acc: any, s: any) => {
                      s.courses.forEach((c: any) => {
                        acc[c.grade] = (acc[c.grade] || 0) + 1;
                      });
                      return acc;
                    }, {})
                  ),
                  backgroundColor: [
                    "#fde68a",
                    "#fca5a5",
                    "#a7f3d0",
                    "#93c5fd",
                    "#fcd34d",
                    "#f87171",
                    "#34d399",
                    "#60a5fa",
                    "#fbbf24",
                    "#ef4444",
                    "#10b981",
                    "#3b82f6",
                  ],
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "bottom" },
              },
            }}
            width={300}
            height={300}
          />
        </div>
      </div>
    </div>
  );
}
