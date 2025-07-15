import { FC } from "react";
import Link from "next/link";

interface DashboardLinkCardProps {
  href: string;
  title: string;
  description: string;
}

const DashboardLinkCard: FC<DashboardLinkCardProps> = ({ href, title, description }) => (
  <Link
    href={href}
    className="bg-[#67AEFF]/20 rounded-xl px-6 py-10 shadow flex flex-col items-center hover:bg-[#67AEFF]/30 transition-colors"
  >
    {/* {icon && <div className="mb-2 text-3xl text-[#687FE5]">{icon}</div>} */}
    <span className="text-2xl font-bold text-[#4d9af3]">{title}</span>
    <p className="text-gray-500 mt-2 text-center">{description}</p>
  </Link>
);

export default DashboardLinkCard;
