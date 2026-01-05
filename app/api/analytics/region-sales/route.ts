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
 * 获取各区域的销售额占比数据（用于饼图）
 */
export async function GET() {
  // #region agent log
  writeLog('app/api/analytics/region-sales/route.ts:35', 'API route called', {}, 'C');
  // #endregion
  try {
    const query = `
      SELECT 
        dc.region,
        SUM(fs.quantity * dp.unit_price * (1 - fs.discount)) as total_sales
      FROM fact_sales fs
      INNER JOIN dim_customers dc ON fs.customer_id = dc.customer_id
      INNER JOIN dim_products dp ON fs.product_id = dp.product_id
      WHERE fs.status = 'Completed'
      GROUP BY dc.region
      ORDER BY total_sales DESC
    `;

    // #region agent log
    writeLog('app/api/analytics/region-sales/route.ts:50', 'Before query execution', {}, 'B');
    // #endregion
    const data = await queryAnalyticsDb<{
      region: string;
      total_sales: string; // PostgreSQL 返回 DECIMAL 为字符串
    }>(query);

    // #region agent log
    writeLog('app/api/analytics/region-sales/route.ts:56', 'Query result received', { dataLength: data.length, firstItem: data[0] || null }, 'E');
    // #endregion

    // 转换为数字并格式化
    const formattedData = data.map((item) => ({
      name: item.region || "未知区域",
      value: parseFloat(item.total_sales) || 0,
    }));

    // #region agent log
    writeLog('app/api/analytics/region-sales/route.ts:63', 'Returning response', { formattedDataLength: formattedData.length }, 'C');
    // #endregion
    return NextResponse.json({ data: formattedData });
  } catch (error) {
    // #region agent log
    writeLog('app/api/analytics/region-sales/route.ts:68', 'API error caught', {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
      errorCode: (error as { code?: string })?.code
    }, 'A,B,C');
    // #endregion
    console.error("获取区域销售额数据失败:", error);
    
    // 如果是表不存在的错误，提供更友好的错误信息
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isTableMissing = errorMessage.includes('does not exist') || errorMessage.includes('relation');
    
    return NextResponse.json(
      { 
        error: "获取数据失败", 
        details: errorMessage,
        hint: isTableMissing 
          ? "数据库表不存在。请确保已创建 fact_sales、dim_products 和 dim_customers 表。" 
          : undefined
      },
      { status: 500 }
    );
  }
}

