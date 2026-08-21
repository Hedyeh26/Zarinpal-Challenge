import { getDb } from "../db/client";

export function getOverallStats() {
  const db = getDb();
  return db.prepare(`
    SELECT
      COUNT(*) as total_transactions,
      COUNT(DISTINCT session_key) as total_sessions,
      SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) as successful_sessions,
      SUM(CASE WHEN session_status = 'Failed' THEN 1 ELSE 0 END) as failed_sessions,
      ROUND(100.0 * SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(DISTINCT session_key), 2) as success_rate,
      SUM(amount) as total_amount,
      SUM(adjusted_fee) as total_fee,
      AVG(amount) as avg_amount
    FROM transactions
  `).get();
}

export function getMerchantStats(limit = 20) {
  const db = getDb();
  return db.prepare(`
    SELECT
      merchant_key,
      COUNT(DISTINCT session_key) as total_sessions,
      COUNT(*) as total_tries,
      SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) as successful_sessions,
      SUM(CASE WHEN session_status = 'Failed' THEN 1 ELSE 0 END) as failed_sessions,
      ROUND(100.0 * SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(DISTINCT session_key), 2) as success_rate,
      SUM(amount) as total_amount,
      ROUND(AVG(amount)) as avg_amount,
      ROUND(AVG(try_seq) + 1, 2) as avg_retries,
      SUM(adjusted_fee) as total_fee
    FROM transactions
    GROUP BY merchant_key
    ORDER BY total_amount DESC
    LIMIT ?
  `).all(limit);
}

export function getMerchantDetail(merchantKey: string) {
  const db = getDb();
  return db.prepare(`
    SELECT
      merchant_key,
      COUNT(DISTINCT session_key) as total_sessions,
      COUNT(*) as total_tries,
      SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) as successful_sessions,
      SUM(CASE WHEN session_status = 'Failed' THEN 1 ELSE 0 END) as failed_sessions,
      ROUND(100.0 * SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(DISTINCT session_key), 2) as success_rate,
      SUM(amount) as total_amount,
      ROUND(AVG(amount)) as avg_amount,
      ROUND(AVG(try_seq) + 1, 2) as avg_retries,
      SUM(adjusted_fee) as total_fee
    FROM transactions
    WHERE merchant_key = ?
    GROUP BY merchant_key
  `).get(merchantKey);
}

export function getPSPStats() {
  const db = getDb();
  return db.prepare(`
    SELECT
      psp_code,
      COUNT(*) as total_tries,
      SUM(CASE WHEN try_status = 'Verified' THEN 1 ELSE 0 END) as successful_tries,
      ROUND(100.0 * SUM(CASE WHEN try_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate,
      SUM(amount) as total_amount
    FROM transactions
    WHERE psp_code IS NOT NULL
    GROUP BY psp_code
    ORDER BY success_rate DESC
  `).all();
}

export function getRetryPattern() {
  const db = getDb();
  return db.prepare(`
    SELECT
      try_seq,
      COUNT(*) as total,
      SUM(CASE WHEN try_status = 'Verified' THEN 1 ELSE 0 END) as successful,
      ROUND(100.0 * SUM(CASE WHEN try_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
    FROM transactions
    GROUP BY try_seq
    ORDER BY try_seq
  `).all();
}

export function getBankPSPMatrix() {
  const db = getDb();
  return db.prepare(`
    SELECT
      issuer_bank_code,
      psp_code,
      COUNT(*) as total,
      SUM(CASE WHEN try_status = 'Verified' THEN 1 ELSE 0 END) as successful,
      ROUND(100.0 * SUM(CASE WHEN try_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
    FROM transactions
    WHERE issuer_bank_code IS NOT NULL AND psp_code IS NOT NULL
    GROUP BY issuer_bank_code, psp_code
    HAVING total > 100
    ORDER BY issuer_bank_code, success_rate DESC
  `).all();
}

export function getAmountRangeStats() {
  const db = getDb();
  return db.prepare(`
    SELECT
      CASE
        WHEN amount < 1000000 THEN 'Under 1M'
        WHEN amount < 5000000 THEN '1M-5M'
        WHEN amount < 10000000 THEN '5M-10M'
        WHEN amount < 50000000 THEN '10M-50M'
        ELSE 'Over 50M'
      END as range_name,
      COUNT(*) as total,
      SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) as successful,
      ROUND(100.0 * SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate,
      MIN(amount) as min_amount,
      MAX(amount) as max_amount
    FROM transactions
    GROUP BY range_name
    ORDER BY MIN(amount)
  `).all();
}

export function getHourlyPattern() {
  const db = getDb();
  return db.prepare(`
    SELECT
      CAST(strftime('%H', created_at) AS INTEGER) as hour,
      COUNT(*) as total,
      SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) as successful,
      ROUND(100.0 * SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
    FROM transactions
    GROUP BY hour
    ORDER BY hour
  `).all();
}

export function getDailyTrend(days = 30) {
  const db = getDb();
  return db.prepare(`
    SELECT
      DATE(created_at) as date,
      COUNT(*) as total,
      SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) as successful,
      ROUND(100.0 * SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate,
      SUM(amount) as total_amount
    FROM transactions
    WHERE created_at >= DATE('now', '-' || ? || ' days')
    GROUP BY DATE(created_at)
    ORDER BY date
  `).all(days);
}

export function getRevenueLeakage() {
  const db = getDb();
  return db.prepare(`
    SELECT
      merchant_key,
      COUNT(DISTINCT session_key) as failed_sessions,
      SUM(amount) as lost_revenue,
      ROUND(AVG(amount)) as avg_lost_amount
    FROM transactions
    WHERE session_status = 'Failed'
    GROUP BY merchant_key
    ORDER BY lost_revenue DESC
    LIMIT 20
  `).all();
}

export function getFailureReasons() {
  const db = getDb();
  return db.prepare(`
    SELECT
      try_status,
      COUNT(*) as count,
      ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM transactions), 2) as percentage
    FROM transactions
    GROUP BY try_status
    ORDER BY count DESC
  `).all();
}

export function getCategoryStats() {
  const db = getDb();
  return db.prepare(`
    SELECT
      category_title,
      COUNT(DISTINCT session_key) as sessions,
      SUM(amount) as total_amount,
      ROUND(100.0 * SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(DISTINCT session_key), 2) as success_rate
    FROM transactions
    WHERE category_title IS NOT NULL
    GROUP BY category_title
    ORDER BY total_amount DESC
    LIMIT 15
  `).all();
}

// === Deep Analysis Queries ===

// Pareto: Top 20% merchants account for X% of volume
export function getParetoAnalysis() {
  const db = getDb();
  return db.prepare(`
    WITH ranked AS (
      SELECT
        merchant_key,
        SUM(amount) as volume,
        ROW_NUMBER() OVER (ORDER BY SUM(amount) DESC) as rank_num,
        COUNT(*) OVER () as total_merchants
      FROM transactions
      GROUP BY merchant_key
    ),
    cumulative AS (
      SELECT
        merchant_key,
        volume,
        rank_num,
        total_merchants,
        ROUND(100.0 * rank_num / total_merchants, 1) as percentile,
        ROUND(100.0 * SUM(volume) OVER (ORDER BY rank_num) / SUM(volume) OVER (), 1) as cumulative_pct
      FROM ranked
    )
    SELECT
      CASE
        WHEN percentile <= 20 THEN 'Top 20%'
        WHEN percentile <= 50 THEN '20-50%'
        WHEN percentile <= 80 THEN '50-80%'
        ELSE 'Bottom 20%'
      END as segment,
      COUNT(*) as merchants,
      SUM(volume) as total_volume,
      ROUND(100.0 * SUM(volume) / (SELECT SUM(amount) FROM transactions), 1) as volume_pct,
      ROUND(100.0 * SUM(CASE WHEN s.session_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(DISTINCT s.session_key), 2) as success_rate
    FROM cumulative c
    JOIN transactions s ON s.merchant_key = c.merchant_key
    GROUP BY segment
    ORDER BY MIN(c.rank_num)
  `).all();
}

// Segmentation by volume
export function getMerchantSegmentation() {
  const db = getDb();
  return db.prepare(`
    WITH merchant_volumes AS (
      SELECT
        merchant_key,
        COUNT(DISTINCT session_key) as sessions,
        SUM(amount) as volume,
        ROUND(100.0 * SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(DISTINCT session_key), 2) as success_rate
      FROM transactions
      GROUP BY merchant_key
    )
    SELECT
      CASE
        WHEN sessions >= 1000 THEN 'High Volume (1000+)'
        WHEN sessions >= 100 THEN 'Medium Volume (100-999)'
        WHEN sessions >= 10 THEN 'Low Volume (10-99)'
        ELSE 'Micro Volume (<10)'
      END as segment,
      COUNT(*) as merchants,
      ROUND(AVG(success_rate), 2) as avg_success_rate,
      ROUND(AVG(volume)) as avg_volume,
      SUM(volume) as total_volume
    FROM merchant_volumes
    GROUP BY segment
    ORDER BY avg_volume DESC
  `).all();
}

// Confounding: PSP performance controlling for merchant size
export function getPSPByMerchantSize() {
  const db = getDb();
  return db.prepare(`
    WITH merchant_sizes AS (
      SELECT
        merchant_key,
        CASE
          WHEN COUNT(DISTINCT session_key) >= 100 THEN 'Large'
          WHEN COUNT(DISTINCT session_key) >= 10 THEN 'Medium'
          ELSE 'Small'
        END as size
      FROM transactions
      GROUP BY merchant_key
    )
    SELECT
      t.psp_code,
      ms.size,
      COUNT(*) as total,
      ROUND(100.0 * SUM(CASE WHEN t.try_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
    FROM transactions t
    JOIN merchant_sizes ms ON t.merchant_key = ms.merchant_key
    WHERE t.psp_code IS NOT NULL
    GROUP BY t.psp_code, ms.size
    HAVING total > 50
    ORDER BY t.psp_code, ms.size
  `).all();
}

// Failure reason by PSP
export function getFailureByPSP() {
  const db = getDb();
  return db.prepare(`
    SELECT
      psp_code,
      try_status,
      COUNT(*) as count,
      ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY psp_code), 1) as pct_of_psp
    FROM transactions
    WHERE psp_code IS NOT NULL
    GROUP BY psp_code, try_status
    ORDER BY psp_code, count DESC
  `).all();
}

// Top failure reasons by switch response code
export function getFailureByResponseCode() {
  const db = getDb();
  return db.prepare(`
    SELECT
      switch_response_code,
      COUNT(*) as count,
      ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM transactions WHERE session_status = 'Failed'), 1) as pct,
      ROUND(AVG(amount)) as avg_amount
    FROM transactions
    WHERE session_status = 'Failed' AND switch_response_code IS NOT NULL
    GROUP BY switch_response_code
    ORDER BY count DESC
    LIMIT 15
  `).all();
}

// Hourly pattern segmented by PSP
export function getHourlyByPSP() {
  const db = getDb();
  return db.prepare(`
    SELECT
      psp_code,
      CAST(strftime('%H', created_at) AS INTEGER) as hour,
      COUNT(*) as total,
      ROUND(100.0 * SUM(CASE WHEN try_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
    FROM transactions
    WHERE psp_code IS NOT NULL
    GROUP BY psp_code, hour
    ORDER BY psp_code, hour
  `).all();
}

// Consecutive failure analysis
export function getConsecutiveFailures() {
  const db = getDb();
  return db.prepare(`
    SELECT
      max_retries,
      COUNT(*) as merchants,
      ROUND(AVG(success_rate), 2) as avg_success_rate
    FROM (
      SELECT
        merchant_key,
        MAX(try_seq) as max_retries,
        ROUND(100.0 * SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) / COUNT(DISTINCT session_key), 2) as success_rate
      FROM transactions
      GROUP BY merchant_key
    )
    GROUP BY max_retries
    ORDER BY max_retries
  `).all();
}

export function executeQuery(sql: string) {
  const db = getDb();
  return db.prepare(sql).all();
}
