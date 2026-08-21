import { NextRequest, NextResponse } from "next/server";
import { createMcpServer } from "@/lib/mcp/server";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const handler = async (req: NextRequest) => {
  try {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    await server.connect(transport);
    return await transport.handleRequest(req);
  } catch (error) {
    console.error("MCP error:", error);
    return NextResponse.json(
      { error: "MCP server error" },
      { status: 500 }
    );
  }
};

export { handler as GET, handler as POST, handler as DELETE };
