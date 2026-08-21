"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/lib/utils";
import {
  CreditCard,
  Building2,
  BarChart3,
  Clock,
  TrendingUp,
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

const PSP_COLORS = ["#0A33FF", "#16A34A", "#F59E0B", "#8B5CF6", "#DC2626"];
const CHART_MARGIN = { top: 5, right: 10, left: 10, bottom: 5 };

export default function PSPPage() {
  const [pspData, setPspData] = useState<any[]>([]);
  const [bankPSP, setBankPSP] = useState<any[]>([]);
  const [amountData, setAmountData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics?type=psp").then((r) => r.json()),
      fetch("/api/analytics?type=bank-psp").then((r) => r.json()),
      fetch("/api/analytics?type=amount").then((r) => r.json()),
      fetch("/api/analytics?type=hourly").then((r) => r.json()),
    ]).then(([psp, bank, amount, hourly]) => {
      setPspData(psp);
      setBankPSP(bank);
      setAmountData(amount);
      setHourlyData(hourly);
    });
  }, []);

  const banks = [...new Set(bankPSP.map((d: any) => d.issuer_bank_code))];
  const pspCodes = [...new Set(bankPSP.map((d: any) => d.psp_code))];

  const matrixData = banks.map((bank) => {
    const row: any = { bank };
    pspCodes.forEach((psp) => {
      const cell = bankPSP.find((d: any) => d.issuer_bank_code === bank && d.psp_code === psp);
      row[psp] = cell ? cell.success_rate : null;
    });
    return row;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A33FF]/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[#0A33FF]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#19191A]">تحلیل PSP و بانک</h1>
            <p className="text-sm text-[#6b7280]">مقایسه عملکرد ارائه‌دهندگان خدمات پرداخت</p>
          </div>
        </div>
      </div>

      {/* PSP Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pspData.map((psp: any, i: number) => (
          <Card key={psp.psp_code} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${PSP_COLORS[i % PSP_COLORS.length]}12` }}
                >
                  <CreditCard className="w-5 h-5" style={{ color: PSP_COLORS[i % PSP_COLORS.length] }} />
                </div>
              </div>
              <p className="text-xs font-semibold text-[#6b7280] mb-1">{psp.psp_code}</p>
              <p
                className="text-2xl font-bold tabular-nums"
                style={{ color: PSP_COLORS[i % PSP_COLORS.length] }}
              >
                {formatPercent(psp.success_rate)}
              </p>
              <p className="text-[11px] text-[#6b7280] mt-1 tabular-nums">
                {formatNumber(psp.total_tries)} تلاش
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PSP Comparison */}
      <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0A33FF]/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-[#0A33FF]" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-[#19191A]">مقایسه نرخ موفقیت PSP</CardTitle>
              <p className="text-xs text-[#6b7280]">نرخ موفقیت هر ارائه‌دهنده خدمات پرداخت</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pspData} barSize={60} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="psp_code" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={45} />
              <Tooltip
                formatter={(value: any) => [`${value}%`, "نرخ موفقیت"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #DADBE1", fontSize: "12px" }}
              />
              <Bar dataKey="success_rate" radius={[8, 8, 0, 0]}>
                {pspData.map((_: any, index: number) => (
                  <Cell key={index} fill={PSP_COLORS[index % PSP_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bank-PSP Matrix */}
      <Card className="animate-slide-up" style={{ animationDelay: "250ms" }}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0A33FF]/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#0A33FF]" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-[#19191A]">ماتریس بانک × PSP</CardTitle>
              <p className="text-xs text-[#6b7280]">نرخ موفقیت هر بانک با هر PSP</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DADBE1]">
                  <th className="text-right py-3 px-4 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">بانک</th>
                  {pspCodes.map((psp) => (
                    <th key={psp} className="text-right py-3 px-4 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">
                      {psp}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixData.map((row, i) => (
                  <tr key={i} className="border-b border-[#DADBE1]/50 hover:bg-[#F5F5F5]/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-[#19191A]">{row.bank}</td>
                    {pspCodes.map((psp) => {
                      const val = row[psp];
                      return (
                        <td key={psp} className="py-3 px-4">
                          {val !== null ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium tabular-nums ${
                                val >= 70
                                  ? "bg-[#16A34A]/10 text-[#16A34A]"
                                  : val >= 50
                                  ? "bg-[#F59E0B]/10 text-[#D97706]"
                                  : "bg-[#DC2626]/10 text-[#DC2626]"
                              }`}
                            >
                              {formatPercent(val)}
                            </span>
                          ) : (
                            <span className="text-[#DADBE1] text-xs">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Amount Range + Hourly Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up" style={{ animationDelay: "300ms" }}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0A33FF]/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#0A33FF]" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-[#19191A]">نرخ موفقیت بر اساس مبلغ</CardTitle>
                <p className="text-xs text-[#6b7280]">تأثیر مبلغ تراکنش بر نرخ موفقیت</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={amountData} barSize={40} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="range_name" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={45} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, "نرخ موفقیت"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #DADBE1", fontSize: "12px" }}
                />
                <Bar dataKey="success_rate" radius={[6, 6, 0, 0]} fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: "350ms" }}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0A33FF]/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#0A33FF]" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-[#19191A]">الگوی ساعتی پرداخت‌ها</CardTitle>
                <p className="text-xs text-[#6b7280]">نرخ موفقیت در ساعات مختلف شبانه‌روز</p>
              </div>
            </div>
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
                <Bar dataKey="success_rate" radius={[4, 4, 0, 0]} fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
