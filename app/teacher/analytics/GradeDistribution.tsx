import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function GradeDistribution({ gradeDistribution }: { gradeDistribution: Record<string, number> }) {
  return (
    <div className="">
      <h3 className="font-semibold mb-4 text-center text-xl text-blue-900">Grade Distribution</h3>
      <Pie
        data={{
          labels: Object.keys(gradeDistribution),
          datasets: [
            {
              label: "Grades",
              data: Object.values(gradeDistribution),
              backgroundColor: [
                "#2563eb",
                "#22d3ee",
                "#fbbf24",
                "#f87171",
                "#34d399",
                "#a7f3d0",
                "#fca5a5",
                "#93c5fd",
              ],
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
          },
        }}
        width={320}
        height={320}
      />
    </div>
  );
}
