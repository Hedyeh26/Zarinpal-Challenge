"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Send,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowUp,
  Database,
  Zap,
  TrendingUp,
  AlertTriangle,
  Clock,
  User,
  Bot,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: { name: string; args: any }[];
  timestamp: number;
}

const SUGGESTIONS = [
  { text: "نرخ موفقیت کل پرداخت‌ها چقدر است؟", icon: TrendingUp },
  { text: "کدام PSP بهترین نرخ موفقیت را دارد؟", icon: TrendingUp },
  { text: "چرا پرداخت‌ها شکست می‌خورند؟", icon: AlertTriangle },
  { text: "بهترین ساعت برای پرداخت چه زمانی است؟", icon: Clock },
  { text: "الگوی تلاش مجدد پرداخت‌ها چگونه است؟", icon: Zap },
  { text: "بیشترین درآمد از دست رفته متعلق به کدام پذیرنده است؟", icon: AlertTriangle },
];

const TOOL_LABELS: Record<string, string> = {
  get_overall_stats: "آمار کلی",
  get_merchant_stats: "آمار پذیرندگان",
  get_psp_stats: "آمار PSP",
  get_retry_pattern: "الگوی تلاش مجدد",
  get_bank_psp_matrix: "ماتریس بانک-PSP",
  get_amount_analysis: "تحلیل مبلغ",
  get_hourly_pattern: "الگوی ساعتی",
  get_failure_reasons: "دلایل شکست",
  get_category_stats: "آمار دسته‌بندی",
  get_revenue_leakage: "درآمد از دست رفته",
  query_data: "کوئری سفارشی",
};

function ToolBadge({ name, args }: { name: string; args?: any }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-2 rounded-xl bg-[#0A33FF]/5 border border-[#0A33FF]/10 p-2.5 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full"
      >
        <div className="w-5 h-5 rounded-md bg-[#0A33FF]/10 flex items-center justify-center shrink-0">
          <Database className="w-3 h-3 text-[#0A33FF]" />
        </div>
        <span className="text-[#6b7280] flex-1 text-right">
          {TOOL_LABELS[name] || name}
        </span>
        <span className="text-[#16A34A] text-[10px]">✓</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {expanded && args && (
        <pre className="mt-2 p-2 bg-[#F5F5F5] rounded-lg text-[10px] font-mono overflow-x-auto text-[#6b7280]">
          {JSON.stringify(args, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Build message history for API
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.text || "پاسخی دریافت نشد.",
        toolCalls: data.toolCalls || [],
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errMsg: Message = {
        id: `e-${Date.now()}`,
        role: "assistant",
        content: "خطا در اتصال. لطفاً دوباره تلاش کنید.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleSuggestionClick = (text: string) => {
    sendMessage(text);
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5]">
      {/* Header */}
      <div className="border-b border-[#DADBE1] bg-white px-4 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A33FF] flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#19191A]">دستیار هوش مصنوعی</h1>
            <p className="text-xs text-[#6b7280]">
              تحلیل پرداخت‌های زرین‌پال با هوش مصنوعی
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessages([])}
              className="mr-auto text-xs"
            >
              <X className="w-4 h-4 ml-1" />
              مکالمه جدید
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <img src="/zarinpal-logo.svg" alt="زرین‌پال" className="w-16 h-16 object-contain" />
            </div>
            <h2 className="text-xl font-bold text-[#19191A] mb-2">از من بپرسید...</h2>
            <p className="text-[#6b7280] max-w-md mb-8 text-sm leading-relaxed">
              می‌توانم در تحلیل عملکرد پرداخت‌هایتان کمک کنم.
              هر سوالی درباره نرخ موفقیت، PSP ها، بانک‌ها، یا الگوهای پرداخت دارید، بپرسید.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
              {SUGGESTIONS.map((suggestion) => {
                const Icon = suggestion.icon;
                return (
                  <button
                    key={suggestion.text}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="flex items-start gap-3 p-4 rounded-xl border border-[#DADBE1] bg-white hover:bg-[#F5F5F5] hover:border-[#0A33FF]/20 transition-all text-right group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#0A33FF]/10 flex items-center justify-center shrink-0 group-hover:bg-[#0A33FF]/20 transition-colors">
                      <Icon className="w-4 h-4 text-[#0A33FF]" />
                    </div>
                    <span className="text-sm text-[#6b7280] group-hover:text-[#19191A] transition-colors leading-relaxed">
                      {suggestion.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-[#0A33FF] text-white`}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div className={`max-w-[85%] md:max-w-[70%] ${message.role === "user" ? "text-left" : "text-right"}`}>
                {message.role === "user" ? (
                  <div className="bg-[#0A33FF] text-white rounded-2xl rounded-tr-md px-4 py-3 text-sm leading-relaxed">
                    {message.content}
                  </div>
                ) : (
                  <div className="bg-white border border-[#DADBE1] rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-[#19191A]">
                      {message.content}
                    </div>

                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#DADBE1]/50">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Zap className="w-3 h-3 text-[#16A34A]" />
                          <span className="text-[10px] text-[#16A34A] font-medium">
                            {message.toolCalls.length} منبع داده استفاده شد
                          </span>
                        </div>
                        {message.toolCalls.map((tc, i) => (
                          <ToolBadge key={i} name={tc.name} args={tc.args} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0A33FF] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-[#DADBE1] rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#0A33FF]/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-[#0A33FF]/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-[#0A33FF]/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-[#6b7280]">در حال تحلیل داده‌ها...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#DADBE1] bg-white p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="سوال خود را بنویسید..."
              rows={1}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-[#DADBE1] bg-[#F5F5F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#0A33FF]/30 focus:border-[#0A33FF] resize-none min-h-[44px] max-h-[120px] text-[#19191A] placeholder:text-[#9ca3af] disabled:opacity-50"
              style={{ direction: "rtl" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-[44px] w-[44px] rounded-xl shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="text-[10px] text-[#9ca3af] text-center mt-2">
          داده‌های ۲.۲ میلیون تراکنش زرین‌پال — پاسخ‌ها بر اساس تحلیل واقعی هستند
        </p>
      </div>
    </div>
  );
}
