import { Icons } from "@/components/icons";

interface StatCardProps {
  label: string;
  value: string | number;
  caption: string;
  icon?: keyof typeof Icons;
  accent?: string;
}

function StatCard({
  label,
  value,
  caption,
  icon = "orders",
  accent = "#fbbf24",
}: StatCardProps) {
  const Icon = Icons[icon];

  return (
    <div className="rounded-2xl bg-[#1a1a1a] border border-[#fbbf24]/50 p-6 w-full">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color: accent }} strokeWidth={2} />
        <span className="text-white/50 text-sm">{label}</span>
      </div>

      <p className="mt-5 text-4xl font-bold text-white tabular-nums">{value}</p>

      <div className="mt-4 pt-3 border-t border-white/10">
        <span className="text-white/40 text-xs">{caption}</span>
      </div>
    </div>
  );
}

export default StatCard;
