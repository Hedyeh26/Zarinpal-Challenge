"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercent, formatRials } from "@/lib/utils";
import {
  Users,
  DollarSign,
  AlertTriangle,
  Trophy,
  Medal,
  Award,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CHART_MARGIN = { top: 5, right: 10, left: 10, bottom: 5 };

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [revenueLeakage, setRevenueLeakage] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics?type=merchants").then((r) => r.json()),
      fetch("/api/analytics?type=revenue-leakage").then((r) => r.json()),
    ]).then(([m, rl]) => {
      setMerchants(m);
      setRevenueLeakage(rl);
    });
  }, []);

  const totalVolume = merchants.reduce((sum: number, m: any) => sum + (m.total_amount || 0), 0);
  const avgSuccess = merchants.reduce((sum: number, m: any) => sum + (m.success_rate || 0), 0) / Math.max(merchants.length, 1);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A33FF]/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#0A33FF]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#19191A]">پذیرندگان</h1>
            <p className="text-sm text-[#6b7280]">رتبه‌بندی و عملکرد پذیرندگان زرین‌پال</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0A33FF] text-white">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium opacity-90">تعداد پذیرندگان</span>
          </div>
          <p className="text-2xl font-bold tabular-nums">{formatNumber(merchants.length)}</p>
          <p className="text-xs opacity-80 mt-1">پذیرنده فعال</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#DADBE1]">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-[#0A33FF]" />
            <span className="text-xs font-medium text-[#6b7280]">حجم کل تراکنش</span>
          </div>
          <p className="text-2xl font-bold text-[#19191A] tabular-nums">{formatRials(totalVolume)}</p>
          <p className="text-xs text-[#6b7280] mt-1">مجموع تمام پذیرندگان</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#DADBE1]">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-[#16A34A]" />
            <span className="text-xs font-medium text-[#6b7280]">میانگین نرخ موفقیت</span>
          </div>
          <p className="text-2xl font-bold text-[#19191A] tabular-nums">{formatPercent(avgSuccess)}</p>
          <p className="text-xs text-[#6b7280] mt-1">در تمام پذیرندگان</p>
        </div>
      </div>

      {/* Revenue Leakage Chart */}
      <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#DC2626]/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-[#19191A]">درآمد از دست رفته پذیرندگان</CardTitle>
              <p className="text-xs text-[#6b7280]">پذیرندگان با بیشترین درآمد از دست رفته از پرداخت‌های ناموفق</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueLeakage.slice(0, 10)} barSize={30} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="merchant_key" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000000)}M`} width={50} />
              <Tooltip
                formatter={(value: any) => [formatRials(value), "درآمد از دست رفته"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #DADBE1", fontSize: "12px" }}
              />
              <Bar dataKey="lost_revenue" radius={[6, 6, 0, 0]} fill="#DC2626" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Merchant Table */}
      <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0A33FF]/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-[#0A33FF]" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-[#19191A]">رتبه‌بندی پذیرندگان</CardTitle>
              <p className="text-xs text-[#6b7280]">بر اساس حجم کل تراکنش</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DADBE1]">
                  <th className="text-right py-3 px-4 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">رتبه</th>
                  <th className="text-right py-3 px-4 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">پذیرنده</th>
                  <th className="text-right py-3 px-4 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">جلسات</th>
                  <th className="text-right py-3 px-4 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider hidden sm:table-cell">تلاش‌ها</th>
                  <th className="text-right py-3 px-4 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">نرخ موفقیت</th>
                  <th className="text-right py-3 px-4 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">مبلغ کل</th>
                  <th className="text-right py-3 px-4 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider hidden md:table-cell">میانگین تلاش</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((m: any, i: number) => (
                  <tr key={i} className="border-b border-[#DADBE1]/50 hover:bg-[#F5F5F5]/50 transition-colors">
                    <td className="py-3 px-4">
                      {i === 0 ? (
                        <Trophy className="w-4 h-4 text-[#FFD60A]" />
                      ) : i === 1 ? (
                        <Medal className="w-4 h-4 text-[#DADBE1]" />
                      ) : i === 2 ? (
                        <Award className="w-4 h-4 text-[#FFD60A]/60" />
                      ) : (
                        <span className="text-xs text-[#6b7280] font-medium tabular-nums">{i + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#0A33FF]/10 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[#0A33FF]">
                            {m.merchant_key?.slice(0, 2) || "??"}
                          </span>
                        </div>
                        <span className="font-medium text-xs font-mono text-[#19191A]">{m.merchant_key?.slice(0, 12)}...</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#6b7280] tabular-nums">{formatNumber(m.total_sessions)}</td>
                    <td className="py-3 px-4 text-[#6b7280] tabular-nums hidden sm:table-cell">{formatNumber(m.total_tries)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          m.success_rate >= 70
                            ? "bg-[#16A34A]/10 text-[#16A34A]"
                            : m.success_rate >= 50
                            ? "bg-[#F59E0B]/10 text-[#D97706]"
                            : "bg-[#DC2626]/10 text-[#DC2626]"
                        }`}
                      >
                        {formatPercent(m.success_rate)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#19191A] tabular-nums">{formatRials(m.total_amount)}</td>
                    <td className="py-3 px-4 text-[#6b7280] hidden md:table-cell">{m.avg_retries}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
