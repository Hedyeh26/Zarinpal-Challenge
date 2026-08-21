import { generateText } from "ai";
import { AI_MODEL, SYSTEM_PROMPT } from "@/lib/ai/providers";
import {
  getOverallStats,
  getMerchantStats,
  getPSPStats,
  getRetryPattern,
  getBankPSPMatrix,
  getAmountRangeStats,
  getHourlyPattern,
  getRevenueLeakage,
  getFailureReasons,
  getCategoryStats,
  executeQuery,
} from "@/lib/analytics/queries";
import { z } from "zod";

const cache = new Map<string, { data: any; ts: number }>();
const TTL = 5 * 60 * 1000;

function cached<T>(key: string, fn: () => T): T {
  const c = cache.get(key);
  if (c && Date.now() - c.ts < TTL) return c.data;
  const data = fn();
  cache.set(key, { data, ts: Date.now() });
  return data;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!messages?.length) {
      return Response.json({ error: "No messages" }, { status: 400 });
    }

    const cleanMessages = messages
      .map((m: any) => ({
        role: m.role,
        content:
          typeof m.content === "string"
            ? m.content
            : Array.isArray(m.content)
            ? m.content.filter((p: any) => p.type === "text").map((p: any) => p.text).join("")
            : "",
      }))
      .filter((m: any) => m.content.trim());

    if (!cleanMessages.length) {
      return Response.json({ text: "لطفاً متن ارسال کنید.", toolCalls: [] });
    }

    console.log("[Chat]", cleanMessages[cleanMessages.length - 1].content);

    const { text, toolCalls } = await generateText({
      model: AI_MODEL,
      system: SYSTEM_PROMPT,
      messages: cleanMessages,
      maxSteps: 3,
      tools: {
        get_overall_stats: {
          description: "Get overall payment stats: success rate, total transactions, total amount, failed sessions, revenue",
          parameters: z.object({}),
          execute: async () => cached("overall", getOverallStats),
        },
        get_merchant_stats: {
          description: "Top merchants ranked by transaction volume with success rates",
          parameters: z.object({ limit: z.number().optional().default(20) }),
          execute: async ({ limit }) => cached(`m${limit}`, () => getMerchantStats(limit)),
        },
        get_psp_stats: {
          description: "Compare success rates of all PSPs (Payment Service Providers)",
          parameters: z.object({}),
          execute: async () => cached("psp", getPSPStats),
        },
        get_retry_pattern: {
          description: "How success rate changes with each retry attempt (try_seq 0, 1, 2...)",
          parameters: z.object({}),
          execute: async () => cached("retry", getRetryPattern),
        },
        get_bank_psp_matrix: {
          description: "PSP success rates broken down by issuer bank",
          parameters: z.object({}),
          execute: async () => cached("bankpsp", getBankPSPMatrix),
        },
        get_amount_analysis: {
          description: "Success rates by transaction amount range",
          parameters: z.object({}),
          execute: async () => cached("amount", getAmountRangeStats),
        },
        get_hourly_pattern: {
          description: "Success rate by hour of day - best and worst times",
          parameters: z.object({}),
          execute: async () => cached("hourly", getHourlyPattern),
        },
        get_failure_reasons: {
          description: "Breakdown of payment failure statuses and their percentages",
          parameters: z.object({}),
          execute: async () => cached("failures", getFailureReasons),
        },
        get_category_stats: {
          description: "Stats by product/service category",
          parameters: z.object({}),
          execute: async () => cached("cats", getCategoryStats),
        },
        get_revenue_leakage: {
          description: "Revenue lost from failed payments by merchant",
          parameters: z.object({}),
          execute: async () => cached("leak", getRevenueLeakage),
        },
        query_data: {
          description: "Execute custom SQL SELECT query on transactions table",
          parameters: z.object({ sql: z.string().describe("SQL SELECT query") }),
          execute: async ({ sql }) => {
            if (!sql.trim().toLowerCase().startsWith("select")) return { error: "Only SELECT allowed" };
            try { return executeQuery(sql); } catch (e) { return { error: String(e) }; }
          },
        },
      },
    });

    console.log("[Chat] Done. Tools:", toolCalls?.length || 0, "Text length:", text?.length || 0);

    return Response.json({
      text: text || "پاسخی تولید نشد. لطفاً دوباره تلاش کنید.",
      toolCalls: toolCalls?.map((t) => ({ name: t.toolName, args: t.args })) || [],
    });
  } catch (error) {
    console.error("[Chat] Error:", error);
    return Response.json(
      { text: "خطا در پردازش. لطفاً دوباره تلاش کنید.", toolCalls: [] },
      { status: 500 }
    );
  }
}
