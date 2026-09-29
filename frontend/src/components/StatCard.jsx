function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg = "bg-blue-50",
  iconColor = "text-blue-600",
  valueColor = "text-slate-900",
  trend,
  trendType = "neutral",
}) {
  const trendStyles = {
    positive: "bg-emerald-50 text-emerald-700",
    negative: "bg-red-50 text-red-700",
    neutral: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <div className="mt-2 flex items-baseline gap-2">
            <p
              className={`truncate text-2xl font-bold tracking-tight ${valueColor}`}
            >
              {value}
            </p>

            {trend && (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${trendStyles[trendType]}`}
              >
                {trend}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="mt-1.5 text-xs text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor} text-xl transition-transform duration-200 group-hover:scale-105`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;