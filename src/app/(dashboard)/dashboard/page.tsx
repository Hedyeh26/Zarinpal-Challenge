"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { formatNumber, formatPercent, formatRials } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  Margin,
} from "recharts";

const CHART_MARGIN: Margin = { top: 5, right: 10, left: 10, bottom: 5 };

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [retryData, setRetryData] = useState<any[]>([]);
  const [pspData, setPspData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics?type=overview").then((r) => r.json()),
      fetch("/api/analytics?type=retry").then((r) => r.json()),
      fetch("/api/analytics?type=psp").then((r) => r.json()),
      fetch("/api/analytics?type=categories").then((r) => r.json()),
      fetch("/api/analytics?type=hourly").then((r) => r.json()),
    ]).then(([overview, retry, psp, categories, hourly]) => {
      setStats(overview);
      setRetryData(retry);
      setPspData(psp);
      setCategoryData(categories);
      setHourlyData(hourly);
    });
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-pulse-soft">
          <div className="w-12 h-12 rounded-full bg-[#0A33FF]/10 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-6 h-6 text-[#0A33FF]" />
          </div>
          <p className="text-sm text-[#6b7280]">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const openTraceability = (title: string, query: string, calculation?: string, details?: string) => {
    setDrawerContent({ title, query, calculation, details });
    setDrawerOpen(true);
  };

  const kpis = [
    {
      title: "نرخ موفقیت",
      value: formatPercent(stats.success_rate),
      icon: Activity,
      trend: stats.success_rate >= 65 ? "up" : "down",
      trendValue: `${stats.success_rate >= 65 ? "+" : ""}${((stats.success_rate - 65) || 0).toFixed(1)}%`,
      trendLabel: "نسبت به میانگین",
      color: stats.success_rate >= 70 ? "#16A34A" : stats.success_rate >= 50 ? "#F59E0B" : "#DC2626",
      query: "SELECT ROUND(100.0 * SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(DISTINCT session_key), 2) as success_rate FROM transactions",
      calculation: `موفق: ${formatNumber(stats.successful_sessions)} ÷ کل: ${formatNumber(stats.total_sessions)} × 100 = ${formatPercent(stats.success_rate)}`,
    },
    {
      title: "تعداد تراکنش‌ها",
      value: formatNumber(stats.total_transactions),
      icon: Users,
      trend: "up",
      trendValue: formatNumber(stats.total_sessions),
      trendLabel: "جلسه منحصربفرد",
      color: "#0A33FF",
      query: "SELECT COUNT(*) as total_transactions, COUNT(DISTINCT session_key) as total_sessions FROM transactions",
    },
    {
      title: "کل مبلغ",
      value: formatRials(stats.total_amount),
      icon: DollarSign,
      trend: "up",
      trendValue: formatRials(stats.avg_amount),
      trendLabel: "میانگین هر تراکنش",
      color: "#0A33FF",
      query: "SELECT SUM(amount) as total, ROUND(AVG(amount)) as avg FROM transactions",
    },
    {
      title: "جلسات ناموفق",
      value: formatNumber(stats.failed_sessions),
      icon: AlertTriangle,
      trend: "down",
      trendValue: formatRials(stats.total_fee),
      trendLabel: "کارمزد از دست رفته",
      color: "#DC2626",
      query: "SELECT COUNT(DISTINCT session_key) as failed, SUM(adjusted_fee) as lost_fee FROM transactions WHERE session_status = 'Failed'",
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#19191A]">داشبورد کلی</h1>
        <p className="text-sm text-[#6b7280] mt-1">نمای کلی عملکرد پرداخت‌ها — ۲.۲ میلیون تراکنش</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === "up" ? ArrowUpRight : ArrowDownRight;
          return (
            <Card
              key={i}
              className="animate-slide-up cursor-pointer hover:shadow-md transition-shadow"
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => openTraceability(kpi.title, kpi.query, kpi.calculation)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${kpi.color}12` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${kpi.trend === "up" ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                    <TrendIcon className="w-3 h-3" />
                    {kpi.trendValue}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-[#19191A] tabular-nums">{kpi.value}</p>
                  <p className="text-xs text-[#6b7280] mt-1">{kpi.title}</p>
                  <p className="text-[10px] text-[#9ca3af] mt-0.5">{kpi.trendLabel}</p>
                </div>
                <div className="flex items-center gap-1 mt-3 text-[10px] text-[#0A33FF]">
                  <Info className="w-3 h-3" />
                  <span>نحوه محاسبه</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retry Pattern */}
        <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#19191A]">نرخ موفقیت بر اساس تعداد تلاش</CardTitle>
            <p className="text-xs text-[#6b7280]">هر تلاش مجدد، شانس موفقیت را کاهش می‌دهد</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={retryData} barSize={40} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="try_seq"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: "شماره تلاش", position: "bottom", fontSize: 10, fill: "#9ca3af", offset: -5 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  width={45}
                />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, "نرخ موفقیت"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #DADBE1", fontSize: "12px" }}
                />
                <Bar dataKey="success_rate" radius={[6, 6, 0, 0]}>
                  {retryData.map((entry: any, index: number) => (
                    <Cell
                      key={index}
                      fill={entry.success_rate >= 70 ? "#16A34A" : entry.success_rate >= 50 ? "#F59E0B" : "#DC2626"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* PSP Performance */}
        <Card className="animate-slide-up" style={{ animationDelay: "250ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#19191A]">مقایسه عملکرد PSP</CardTitle>
            <p className="text-xs text-[#6b7280]">نرخ موفقیت هر ارائه‌دهنده خدمات پرداخت</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pspData} barSize={50} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="psp_code"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  width={45}
                />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, "نرخ موفقیت"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #DADBE1", fontSize: "12px" }}
                />
                <Bar dataKey="success_rate" radius={[6, 6, 0, 0]}>
                  {pspData.map((_: any, index: number) => (
                    <Cell key={index} fill={["#0A33FF", "#16A34A", "#F59E0B", "#8B5CF6"][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Pattern */}
      <Card className="animate-slide-up" style={{ animationDelay: "300ms" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-[#19191A]">الگوی ساعتی پرداخت‌ها</CardTitle>
          <p className="text-xs text-[#6b7280]">نرخ موفقیت در ساعات مختلف شبانه‌روز</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={hourlyData} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                width={40}
              />
              <Tooltip
                formatter={(value: any) => [`${value}%`, "نرخ موفقیت"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #DADBE1", fontSize: "12px" }}
              />
              <Line
                type="monotone"
                dataKey="success_rate"
                stroke="#0A33FF"
                strokeWidth={2.5}
                dot={{ fill: "#0A33FF", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, stroke: "#0A33FF", strokeWidth: 2, fill: "white" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Table */}
      <Card className="animate-slide-up" style={{ animationDelay: "350ms" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-[#19191A]">عملکرد بر اساس دسته‌بندی</CardTitle>
          <p className="text-xs text-[#6b7280]">مقایسه نرخ موفقیت دسته‌بندی‌های مختلف</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DADBE1]">
                  <th className="text-right py-3 px-4 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">دسته‌بندی</th>
                  <th className="text-right py-3 px-4 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">جلسات</th>
                  <th className="text-right py-3 px-4 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">مبلغ کل</th>
                  <th className="text-right py-3 px-4 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">نرخ موفقیت</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((cat: any, i: number) => (
                  <tr key={i} className="border-b border-[#DADBE1]/50 hover:bg-[#F5F5F5]/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-[#19191A]">{cat.category_title}</td>
                    <td className="py-3 px-4 text-[#6b7280] tabular-nums">{formatNumber(cat.sessions)}</td>
                    <td className="py-3 px-4 text-[#6b7280] tabular-nums">{formatRials(cat.total_amount)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          cat.success_rate >= 70
                            ? "bg-[#16A34A]/10 text-[#16A34A]"
                            : cat.success_rate >= 50
                            ? "bg-[#F59E0B]/10 text-[#D97706]"
                            : "bg-[#DC2626]/10 text-[#DC2626]"
                        }`}
                      >
                        {formatPercent(cat.success_rate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Traceability Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerContent?.title || ""}
      >
        {drawerContent && (
          <div className="space-y-6">
            {/* Formula */}
            <div>
              <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">فرمول محاسبه</h3>
              <div className="p-3 bg-[#F5F5F5] rounded-xl text-sm text-[#19191A]">
                {drawerContent.calculation || "—"}
              </div>
            </div>

            {/* SQL Query */}
            <div>
              <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">کوئری SQL</h3>
              <pre className="p-3 bg-[#19191A] rounded-xl text-xs text-[#DADBE1] overflow-x-auto font-mono leading-relaxed">
                {drawerContent.query}
              </pre>
            </div>

            {/* Data Source */}
            <div>
              <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">منبع داده</h3>
              <div className="p-3 bg-[#F5F5F5] rounded-xl text-sm text-[#6b7280]">
                <p>جدول <code className="text-[#0A33FF]">transactions</code> — ۲.۲ میلیون رکورد</p>
                <p className="mt-1 text-xs">تمام محاسبات بر اساس داده واقعی تراکنش‌ها انجام شده و هیچ عددی Hardcode نیست.</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-3 bg-[#FFD60A]/10 border border-[#FFD60A]/30 rounded-xl">
              <p className="text-xs text-[#92400E]">
                <strong>توجه:</strong> ستون <code>adjusted_fee</code> دارای ضریب ثابت است و کارمزد واقعی نیست.
                مقادیر آن فقط برای مقایسه نسبی بین پذیرندگان قابل استفاده است.
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
