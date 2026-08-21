"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { formatNumber, formatPercent, formatRials } from "@/lib/utils";
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Info,
  Database,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Zap,
  Target,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CHART_MARGIN = { top: 5, right: 10, left: 10, bottom: 5 };

function InsightCard({ insight, index, onTrace }: { insight: any; index: number; onTrace: (i: any) => void }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = insight.severity === "critical" ? AlertTriangle : insight.severity === "warning" ? Info : CheckCircle2;

  return (
    <Card
      className={`animate-slide-up border-r-[3px] ${
        insight.severity === "critical"
          ? "border-r-[#DC2626]"
          : insight.severity === "warning"
          ? "border-r-[#F59E0B]"
          : "border-r-[#16A34A]"
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor:
                insight.severity === "critical"
                  ? "#DC262612"
                  : insight.severity === "warning"
                  ? "#F59E0B12"
                  : "#16A34A12",
            }}
          >
            <Icon
              className="w-5 h-5"
              style={{
                color:
                  insight.severity === "critical"
                    ? "#DC2626"
                    : insight.severity === "warning"
                    ? "#D97706"
                    : "#16A34A",
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#19191A]">{insight.title}</h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  insight.severity === "critical"
                    ? "bg-[#DC2626]/10 text-[#DC2626]"
                    : insight.severity === "warning"
                    ? "bg-[#F59E0B]/10 text-[#D97706]"
                    : "bg-[#16A34A]/10 text-[#16A34A]"
                }`}
              >
                {insight.severity === "critical" ? "بحرانی" : insight.severity === "warning" ? "هشدار" : "مثبت"}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#19191A] mt-2 tabular-nums">{insight.value}</p>
            <p className="text-xs text-[#6b7280] mt-1">{insight.detail}</p>

            {/* Hypothesis */}
            {insight.hypothesis && (
              <div className="mt-3 p-2.5 bg-[#0A33FF]/5 rounded-lg border border-[#0A33FF]/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className="w-3 h-3 text-[#0A33FF]" />
                  <span className="text-[10px] font-semibold text-[#0A33FF] uppercase tracking-wider">فرضیه</span>
                </div>
                <p className="text-xs text-[#19191A]">{insight.hypothesis}</p>
              </div>
            )}

            {/* Action */}
            {insight.action && (
              <div className="mt-3 p-2.5 bg-[#FFD60A]/10 rounded-lg border border-[#FFD60A]/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3 h-3 text-[#92400E]" />
                  <span className="text-[10px] font-semibold text-[#92400E] uppercase tracking-wider">اقدام پیشنهادی</span>
                </div>
                <p className="text-xs text-[#19191A]">{insight.action}</p>
              </div>
            )}

            {/* Traceability */}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => onTrace(insight)}
                className="flex items-center gap-1.5 text-xs text-[#0A33FF] hover:text-[#0A33FF]/80 transition-colors"
              >
                <Database className="w-3 h-3" />
                <span>نحوه محاسبه</span>
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#19191A] transition-colors"
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                <span>جزئیات</span>
              </button>
            </div>

            {/* Expanded Details */}
            {expanded && insight.evidence && (
              <div className="mt-3 p-3 bg-[#F5F5F5] rounded-xl animate-fade-in">
                <p className="text-xs text-[#6b7280] leading-relaxed">{insight.evidence}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InsightsPage() {
  const [stats, setStats] = useState<any>(null);
  const [retryData, setRetryData] = useState<any[]>([]);
  const [pspData, setPspData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [revenueLeakage, setRevenueLeakage] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics?type=overview").then((r) => r.json()),
      fetch("/api/analytics?type=retry").then((r) => r.json()),
      fetch("/api/analytics?type=psp").then((r) => r.json()),
      fetch("/api/analytics?type=hourly").then((r) => r.json()),
      fetch("/api/analytics?type=revenue-leakage").then((r) => r.json()),
    ]).then(([overview, retry, psp, hourly, leakage]) => {
      setStats(overview);
      setRetryData(retry);
      setPspData(psp);
      setHourlyData(hourly);
      setRevenueLeakage(leakage);
    });
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-pulse-soft">
          <div className="w-12 h-12 rounded-full bg-[#0A33FF]/10 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-6 h-6 text-[#0A33FF]" />
          </div>
          <p className="text-sm text-[#6b7280]">در حال تحلیل داده‌ها...</p>
        </div>
      </div>
    );
  }

  const bestPSP = pspData.reduce(
    (best: any, curr: any) => (curr.success_rate > (best?.success_rate || 0) ? curr : best),
    null
  );
  const worstPSP = pspData.reduce(
    (worst: any, curr: any) => (curr.success_rate < (worst?.success_rate || 100) ? curr : worst),
    null
  );
  const retry0 = retryData.find((r: any) => r.try_seq === 0);
  const retry1 = retryData.find((r: any) => r.try_seq === 1);
  const bestHour = hourlyData.reduce(
    (best: any, curr: any) => (curr.success_rate > (best?.success_rate || 0) ? curr : best),
    null
  );
  const worstHour = hourlyData.reduce(
    (worst: any, curr: any) => (curr.success_rate < (worst?.success_rate || 100) ? curr : worst),
    null
  );
  const totalLostRevenue = revenueLeakage.reduce((sum: number, r: any) => sum + r.lost_revenue, 0);

  const insights = [
    {
      title: "نرخ موفقیت کل پرداخت‌ها",
      value: formatPercent(stats.success_rate),
      detail: `از ${formatNumber(stats.total_sessions)} جلسه پرداخت، ${formatNumber(stats.successful_sessions)} موفق بوده`,
      severity: stats.success_rate >= 70 ? "success" : stats.success_rate >= 50 ? "warning" : "critical",
      hypothesis: "آیا نرخ موفقیت پایین‌تر از میانگین صنعت (۷۵٪) است؟",
      action: `نرخ موفقیت فعلی ${formatPercent(stats.success_rate)} است. ${stats.success_rate < 70 ? "پیشنهاد: بررسی دلایل اصلی شکست و بهبود فرآیند پرداخت." : "عملکرد قابل قبول است."}`,
      evidence: `تعداد کل جلسات: ${formatNumber(stats.total_sessions)} | موفق: ${formatNumber(stats.successful_sessions)} | ناموفق: ${formatNumber(stats.failed_sessions)}`,
      query: "SELECT COUNT(DISTINCT session_key) as total, SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) as successful, ROUND(100.0 * SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(DISTINCT session_key), 2) as success_rate FROM transactions",
      calculation: `success_rate = ${formatNumber(stats.successful_sessions)} / ${formatNumber(stats.total_sessions)} × 100 = ${formatPercent(stats.success_rate)}`,
    },
    {
      title: "بهترین PSP",
      value: bestPSP ? `${bestPSP.psp_code}: ${formatPercent(bestPSP.success_rate)}` : "-",
      detail: `${bestPSP?.psp_code} با ${formatNumber(bestPSP?.total_tries || 0)} تلاش — بالاترین نرخ موفقیت`,
      severity: "success",
      hypothesis: "آیا PSP انتخابی تأثیر مستقیم بر نرخ موفقیت دارد؟",
      action: `اگر از ${bestPSP?.psp_code} استفاده نمی‌کنید، انتقال به این PSP می‌تواند نرخ موفقیت را بهبود دهد.`,
      evidence: `تمام PSPها مقایسه شدند. ${bestPSP?.psp_code} با ${formatPercent(bestPSP?.success_rate)} بالاترین نرخ را دارد.`,
      query: "SELECT psp_code, COUNT(*) as total, ROUND(100.0 * SUM(CASE WHEN try_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate FROM transactions WHERE psp_code IS NOT NULL GROUP BY psp_code ORDER BY success_rate DESC",
      calculation: `بهترین PSP: MAX(success_rate) = ${bestPSP?.psp_code}`,
    },
    {
      title: "افت نرخ موفقیت در تلاش دوم",
      value: retry0 && retry1 ? `${formatPercent(retry0.success_rate - retry1.success_rate)} افت` : "-",
      detail: `تلاش اول: ${formatPercent(retry0?.success_rate || 0)} → تلاش دوم: ${formatPercent(retry1?.success_rate || 0)}`,
      severity: "warning",
      hypothesis: "آیا هر تلاش مجدد، شانس موفقیت را به شدت کاهش می‌دهد؟",
      action: "پیشنهاد: بهبود تجربه کاربری در مرحله اول پرداخت تا نیاز به تلاش مجدد کاهش یابد.",
      evidence: `تلاش ۰: ${formatNumber(retry0?.total || 0)} تراکنش | تلاش ۱: ${formatNumber(retry1?.total || 0)} تراکنش`,
      query: "SELECT try_seq, COUNT(*) as total, ROUND(100.0 * SUM(CASE WHEN try_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate FROM transactions GROUP BY try_seq ORDER BY try_seq",
      calculation: `افت = ${formatPercent(retry0?.success_rate || 0)} - ${formatPercent(retry1?.success_rate || 0)}`,
    },
    {
      title: "بهترین ساعت پرداخت",
      value: bestHour ? `ساعت ${bestHour.hour}:00 — ${formatPercent(bestHour.success_rate)}` : "-",
      detail: bestHour ? `${formatNumber(bestHour.total)} تراکنش در این ساعت` : "",
      severity: "success",
      hypothesis: "آیا زمان پرداخت بر نرخ موفقیت تأثیر دارد؟",
      action: `تبلیغات و اعلان‌های پرداخت را در ساعت ${bestHour?.hour}:00 تنظیم کنید تا نرخ تبدیل بهبود یابد.`,
      query: "SELECT CAST(strftime('%H', created_at) AS INTEGER) as hour, COUNT(*) as total, ROUND(100.0 * SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate FROM transactions GROUP BY hour ORDER BY success_rate DESC LIMIT 1",
    },
    {
      title: "درآمد از دست رفته",
      value: formatRials(totalLostRevenue),
      detail: `از ${formatNumber(revenueLeakage.length)} پذیرنده — میانگین ${formatRials(totalLostRevenue / Math.max(revenueLeakage.length, 1))} به ازای هر پذیرنده`,
      severity: "critical",
      hypothesis: "آیا پذیرندگان خاصی بیشترین درآمد را از دست می‌دهند؟",
      action: "با پذیرندگان بالای لیست تماس بگیرید و راهکارهای بهبود نرخ موفقیت را ارائه دهید.",
      query: "SELECT merchant_key, COUNT(DISTINCT session_key) as failed, SUM(amount) as lost FROM transactions WHERE session_status = 'Failed' GROUP BY merchant_key ORDER BY lost DESC LIMIT 10",
      calculation: `مجموع از دست رفته: SUM(amount) WHERE session_status = 'Failed' = ${formatRials(totalLostRevenue)}`,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFD60A]/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-[#92400E]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#19191A]">بینش‌های کلیدی</h1>
            <p className="text-sm text-[#6b7280]">تحلیل فرضیه‌محور با قابلیت ردیابی کامل</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0A33FF] text-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-medium opacity-90">بهترین PSP</span>
          </div>
          <p className="text-xl font-bold">{bestPSP?.psp_code || "-"}</p>
          <p className="text-xs opacity-80 mt-1">{formatPercent(bestPSP?.success_rate || 0)} نرخ موفقیت</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#DC2626]/10 border border-[#DC2626]/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
            <span className="text-xs font-medium text-[#DC2626]">بدترین PSP</span>
          </div>
          <p className="text-xl font-bold text-[#DC2626]">{worstPSP?.psp_code || "-"}</p>
          <p className="text-xs text-[#DC2626]/80 mt-1">{formatPercent(worstPSP?.success_rate || 0)} نرخ موفقیت</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#FFD60A]/20 border border-[#FFD60A]/30">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-[#92400E]" />
            <span className="text-xs font-medium text-[#92400E]">درآمد از دست رفته</span>
          </div>
          <p className="text-xl font-bold text-[#92400E]">{formatRials(totalLostRevenue)}</p>
          <p className="text-xs text-[#92400E]/80 mt-1">از پرداخت‌های ناموفق</p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <InsightCard
            key={i}
            insight={insight}
            index={i}
            onTrace={(ins) => {
              setDrawerContent(ins);
              setDrawerOpen(true);
            }}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up" style={{ animationDelay: "500ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#19191A]">نرخ موفقیت بر اساس تلاش</CardTitle>
            <p className="text-xs text-[#6b7280]">الگوی تلاش مجدد پرداخت‌ها</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={retryData} barSize={40} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="try_seq" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={45} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, "نرخ موفقیت"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #DADBE1", fontSize: "12px" }}
                />
                <Bar dataKey="success_rate" radius={[6, 6, 0, 0]}>
                  {retryData.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.success_rate >= 70 ? "#16A34A" : entry.success_rate >= 50 ? "#F59E0B" : "#DC2626"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: "550ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#19191A]">الگوی ساعتی پرداخت‌ها</CardTitle>
            <p className="text-xs text-[#6b7280]">نرخ موفقیت در ساعات مختلف</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hourlyData} barSize={16} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} interval={1} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={40} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, "نرخ موفقیت"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #DADBE1", fontSize: "12px" }}
                />
                <Bar dataKey="success_rate" radius={[4, 4, 0, 0]} fill="#0A33FF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Traceability Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerContent?.title || ""}
      >
        {drawerContent && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">فرمول محاسبه</h3>
              <div className="p-3 bg-[#F5F5F5] rounded-xl text-sm text-[#19191A]">
                {drawerContent.calculation || "—"}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">کوئری SQL</h3>
              <pre className="p-3 bg-[#19191A] rounded-xl text-xs text-[#DADBE1] overflow-x-auto font-mono leading-relaxed">
                {drawerContent.query}
              </pre>
            </div>
            {drawerContent.evidence && (
              <div>
                <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">شواهد داده‌ای</h3>
                <div className="p-3 bg-[#F5F5F5] rounded-xl text-sm text-[#6b7280]">{drawerContent.evidence}</div>
              </div>
            )}
            <div className="p-3 bg-[#FFD60A]/10 border border-[#FFD60A]/30 rounded-xl">
              <p className="text-xs text-[#92400E]">
                <strong>توجه:</strong> تمام محاسبات بر اساس داده واقعی ۲.۲ میلیون تراکنش انجام شده است.
                ستون <code>adjusted_fee</code> دارای ضریب ثابت است و فقط برای مقایسه نسبی معتبر است.
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
