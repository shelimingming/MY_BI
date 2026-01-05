import { NextResponse } from "next/server";
import { queryAnalyticsDb } from "@/lib/analytics-db";
import { appendFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * 写入日志的辅助函数
 */
function writeLog(location: string, message: string, data: Record<string, unknown>, hypothesisId: string) {
  try {
    const logDir = join(process.cwd(), '.cursor');
    const logFile = join(logDir, 'debug.log');
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }
    const logEntry = JSON.stringify({
      location,
      message,
      data,
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId
    }) + '\n';
    appendFileSync(logFile, logEntry);
  } catch (e) {
    console.error('Log write failed:', e);
  }
}

/**
 * 获取每月的销售趋势和毛利率数据（用于折线图 + 柱状图）
 */
export async function GET() {
  // #region agent log
  writeLog('app/api/analytics/monthly-trends/route.ts:33', 'API route called', {}, 'C');
  // #endregion
  try {
    const query = `
      SELECT 
        TO_CHAR(fs.order_date, 'YYYY-MM') as month,
        SUM(fs.quantity * dp.unit_price * (1 - fs.discount)) as total_sales,
        SUM(fs.quantity * dp.unit_price * (1 - fs.discount)) - SUM(fs.quantity * dp.unit_cost) as total_profit,
        CASE 
          WHEN SUM(fs.quantity * dp.unit_price * (1 - fs.discount)) > 0 
          THEN (SUM(fs.quantity * dp.unit_price * (1 - fs.discount)) - SUM(fs.quantity * dp.unit_cost)) 
               / SUM(fs.quantity * dp.unit_price * (1 - fs.discount)) * 100
          ELSE 0
        END as profit_margin
      FROM fact_sales fs
      INNER JOIN dim_products dp ON fs.product_id = dp.product_id
      WHERE fs.status = 'Completed'
      GROUP BY TO_CHAR(fs.order_date, 'YYYY-MM')
      ORDER BY month ASC
    `;

    // #region agent log
    writeLog('app/api/analytics/monthly-trends/route.ts:48', 'Before query execution', {}, 'B');
    // #endregion
    const data = await queryAnalyticsDb<{
      month: string;
      total_sales: string;
      total_profit: string;
      profit_margin: string;
    }>(query);

    // #region agent log
    writeLog('app/api/analytics/monthly-trends/route.ts:54', 'Query result received', { dataLength: data.length }, 'E');
    // #endregion

    // 格式化数据
    const formattedData = data.map((item) => ({
      month: item.month,
      sales: parseFloat(item.total_sales) || 0,
      profit: parseFloat(item.total_profit) || 0,
      profitMargin: parseFloat(item.profit_margin) || 0,
    }));

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    // #region agent log
    writeLog('app/api/analytics/monthly-trends/route.ts:66', 'API error caught', {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
      errorCode: (error as { code?: string })?.code
    }, 'A,B,C');
    // #endregion
    console.error("获取月度趋势数据失败:", error);
    return NextResponse.json(
      { error: "获取数据失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

