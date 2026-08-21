import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getOverallStats,
  getMerchantStats,
  getPSPStats,
  getRetryPattern,
  getBankPSPMatrix,
  getAmountRangeStats,
  getHourlyPattern,
  getRevenueLeakage,
  executeQuery,
} from "../analytics/queries";

export function createMcpServer() {
  const server = new McpServer({
    name: "zarinpal-analytics",
    version: "1.0.0",
  });

  server.tool(
    "get_overall_stats",
    "Get overall payment statistics including success rate, total volume, and revenue",
    {},
    async () => {
      const stats = getOverallStats();
      return {
        content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
      };
    }
  );

  server.tool(
    "get_merchant_stats",
    "Get payment statistics for all merchants ranked by volume",
    {
      limit: z.number().optional().describe("Maximum number of merchants to return"),
    },
    async ({ limit }) => {
      const stats = getMerchantStats(limit || 20);
      return {
        content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
      };
    }
  );

  server.tool(
    "get_psp_stats",
    "Compare performance of different Payment Service Providers (PSPs)",
    {},
    async () => {
      const stats = getPSPStats();
      return {
        content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
      };
    }
  );

  server.tool(
    "get_retry_pattern",
    "Analyze payment retry patterns - how success rate changes with each retry attempt",
    {},
    async () => {
      const pattern = getRetryPattern();
      return {
        content: [{ type: "text", text: JSON.stringify(pattern, null, 2) }],
      };
    }
  );

  server.tool(
    "get_bank_psp_matrix",
    "Get PSP success rates broken down by bank - shows which PSP works best with which bank",
    {},
    async () => {
      const matrix = getBankPSPMatrix();
      return {
        content: [{ type: "text", text: JSON.stringify(matrix, null, 2) }],
      };
    }
  );

  server.tool(
    "get_amount_analysis",
    "Analyze success rates by transaction amount ranges",
    {},
    async () => {
      const analysis = getAmountRangeStats();
      return {
        content: [{ type: "text", text: JSON.stringify(analysis, null, 2) }],
      };
    }
  );

  server.tool(
    "get_hourly_pattern",
    "Get payment success rates by hour of day - find the best time for payments",
    {},
    async () => {
      const pattern = getHourlyPattern();
      return {
        content: [{ type: "text", text: JSON.stringify(pattern, null, 2) }],
      };
    }
  );

  server.tool(
    "get_revenue_leakage",
    "Estimate revenue lost from failed payments by merchant",
    {},
    async () => {
      const leakage = getRevenueLeakage();
      return {
        content: [{ type: "text", text: JSON.stringify(leakage, null, 2) }],
      };
    }
  );

  server.tool(
    "query_data",
    "Execute a custom SQL query on the transactions table. Only SELECT queries are allowed.",
    {
      sql: z.string().describe("A read-only SQL SELECT query"),
    },
    async ({ sql }) => {
      if (!sql.trim().toLowerCase().startsWith("select")) {
        return {
          content: [{ type: "text", text: "Error: Only SELECT queries are allowed" }],
        };
      }
      try {
        const result = executeQuery(sql);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Query failed"}` }],
        };
      }
    }
  );

  return server;
}
