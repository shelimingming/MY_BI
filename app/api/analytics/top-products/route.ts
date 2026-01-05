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
 * 获取 Top 5 畅销商品数据（用于排行榜）
 */
export async function GET() {
  // #region agent log
  writeLog('app/api/analytics/top-products/route.ts:33', 'API route called', {}, 'C');
  // #endregion
  try {
    const query = `
      SELECT 
        dp.product_id,
        dp.product_name,
        dp.category,
        SUM(fs.quantity) as total_quantity,
        SUM(fs.quantity * dp.unit_price * (1 - fs.discount)) as total_sales
      FROM fact_sales fs
      INNER JOIN dim_products dp ON fs.product_id = dp.product_id
      WHERE fs.status = 'Completed'
      GROUP BY dp.product_id, dp.product_name, dp.category
      ORDER BY total_quantity DESC
      LIMIT 5
    `;

    // #region agent log
    writeLog('app/api/analytics/top-products/route.ts:48', 'Before query execution', {}, 'B');
    // #endregion
    const data = await queryAnalyticsDb<{
      product_id: string;
      product_name: string;
      category: string;
      total_quantity: string;
      total_sales: string;
    }>(query);

    // #region agent log
    writeLog('app/api/analytics/top-products/route.ts:54', 'Query result received', { dataLength: data.length }, 'E');
    // #endregion

    // 格式化数据
    const formattedData = data.map((item, index) => ({
      rank: index + 1,
      productId: item.product_id,
      productName: item.product_name || "未知商品",
      category: item.category || "未分类",
      quantity: parseInt(item.total_quantity) || 0,
      sales: parseFloat(item.total_sales) || 0,
    }));

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    // #region agent log
    writeLog('app/api/analytics/top-products/route.ts:66', 'API error caught', {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
      errorCode: (error as { code?: string })?.code
    }, 'A,B,C');
    // #endregion
    console.error("获取畅销商品数据失败:", error);
    return NextResponse.json(
      { error: "获取数据失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

