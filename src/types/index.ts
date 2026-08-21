export interface Transaction {
  id: number;
  session_key: number;
  try_seq: number;
  terminal_key: string;
  merchant_key: string;
  category_id: number;
  category_title: string;
  amount: number;
  adjusted_fee: number;
  session_status: string;
  try_status: string;
  switch_response_code: string | null;
  psp_code: string | null;
  issuer_bank_code: string | null;
  payer_card_key: string | null;
  verify_type: string;
  init_time_ms: number | null;
  verify_time_ms: number | null;
  created_at: string;
  try_created_at: string | null;
  verified_at: string | null;
  settled_at: string | null;
  expire_in: string | null;
}

export interface MerchantStats {
  merchant_key: string;
  total_sessions: number;
  total_tries: number;
  successful_sessions: number;
  failed_sessions: number;
  success_rate: number;
  total_amount: number;
  avg_amount: number;
  avg_retries: number;
  total_fee: number;
  top_psp: string;
  top_bank: string;
}

export interface PSPStats {
  psp_code: string;
  total_tries: number;
  successful_tries: number;
  success_rate: number;
  total_amount: number;
}

export interface DailyStats {
  date: string;
  total_sessions: number;
  successful_sessions: number;
  success_rate: number;
  total_amount: number;
}

export interface Insight {
  id: number;
  type: string;
  title: string;
  summary: string;
  details: string;
  query: string;
  query_result: string;
  severity: string;
  merchant_key: string | null;
  created_at: string;
}

export interface RetryPattern {
  try_seq: number;
  total: number;
  successful: number;
  success_rate: number;
}

export interface BankPSPMatrix {
  issuer_bank_code: string;
  psp_code: string;
  total: number;
  successful: number;
  success_rate: number;
}

export interface AmountRange {
  range: string;
  total: number;
  successful: number;
  success_rate: number;
}

export interface HourlyPattern {
  hour: number;
  total: number;
  successful: number;
  success_rate: number;
}
