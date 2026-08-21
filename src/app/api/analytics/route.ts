import { NextResponse } from "next/server";
import {
  getOverallStats,
  getMerchantStats,
  getPSPStats,
  getRetryPattern,
  getBankPSPMatrix,
  getAmountRangeStats,
  getHourlyPattern,
  getDailyTrend,
  getRevenueLeakage,
  getFailureReasons,
  getCategoryStats,
  getParetoAnalysis,
  getMerchantSegmentation,
  getPSPByMerchantSize,
  getFailureByPSP,
  getFailureByResponseCode,
  getHourlyByPSP,
  getConsecutiveFailures,
} from "@/lib/analytics/queries";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    switch (type) {
      case "overview":
        return NextResponse.json(getOverallStats());
      case "merchants":
        return NextResponse.json(getMerchantStats());
      case "psp":
        return NextResponse.json(getPSPStats());
      case "retry":
        return NextResponse.json(getRetryPattern());
      case "bank-psp":
        return NextResponse.json(getBankPSPMatrix());
      case "amount":
        return NextResponse.json(getAmountRangeStats());
      case "hourly":
        return NextResponse.json(getHourlyPattern());
      case "daily":
        return NextResponse.json(getDailyTrend());
      case "revenue-leakage":
        return NextResponse.json(getRevenueLeakage());
      case "failures":
        return NextResponse.json(getFailureReasons());
      case "categories":
        return NextResponse.json(getCategoryStats());
      case "pareto":
        return NextResponse.json(getParetoAnalysis());
      case "segmentation":
        return NextResponse.json(getMerchantSegmentation());
      case "psp-by-size":
        return NextResponse.json(getPSPByMerchantSize());
      case "failure-by-psp":
        return NextResponse.json(getFailureByPSP());
      case "failure-by-code":
        return NextResponse.json(getFailureByResponseCode());
      case "hourly-psp":
        return NextResponse.json(getHourlyByPSP());
      case "consecutive":
        return NextResponse.json(getConsecutiveFailures());
      default:
        return NextResponse.json(
          { error: "Unknown analytics type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
