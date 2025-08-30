import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function AssessmentAnalytics({ analytics }: { analytics: any }) {
  return (
    <section className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-blue-900">Assessment Analytics</h2>
      <div className="flex flex-row gap-8 items-center justify-center">
        <div className="">
          <Bar
            data={{
              labels: analytics.assessments.map((a: any) => a.type),
              datasets: [
                {
                  label: "Average Score",
                  data: analytics.assessments.map((a: any) => a.avgScore),
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
              scales: {
                y: { beginAtZero: true, max: 100 },
              },
            }}
            width={520}
            height={320}
          />
        </div>
      </div>
    </section>
  );
}
