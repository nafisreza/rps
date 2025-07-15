import { FC, ReactNode } from "react";


interface DashboardStatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
}


const DashboardStatCard: FC<DashboardStatCardProps> = ({
  label,
  value,
  icon,
  iconBgColor = "#01BBD4", // default one if not provided
}) => (
  <div className="bg-white rounded-xl shadow px-6 py-6 flex items-center min-h-[120px] w-full max-w-[340px]">
    <div className="flex flex-col flex-1 justify-center">
      <span className="text-xs font-semibold text-gray-500 tracking-widest mb-1 uppercase">{label}</span>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
    </div>
    <div
      className="ml-4 flex items-center justify-center rounded-full"
      style={{ backgroundColor: iconBgColor, width: 48, height: 48 }}
    >
      <span className="text-white text-2xl">{icon}</span>
    </div>
  </div>
);

export default DashboardStatCard;
