import { Pool } from "pg";
import { appendFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * 数据分析数据库连接池
 * 用于连接销售数据分析数据库
 */
let pool: Pool | null = null;

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
    // 静默失败，避免影响主流程
    console.error('Log write failed:', e);
  }
}

/**
 * 获取数据库连接池实例
 */
export function getAnalyticsDb() {
  // #region agent log
  writeLog('lib/analytics-db.ts:32', 'getAnalyticsDb called', { poolExists: !!pool }, 'A');
  // #endregion
  if (!pool) {
    // #region agent log
    writeLog('lib/analytics-db.ts:35', 'Creating new pool', { host: 'localhost', port: 5432, database: 'postgres', user: 'sheliming' }, 'A');
    // #endregion
    pool = new Pool({
      host: "localhost",
      port: 5432,
      database: "postgres",
      user: "sheliming",
      password: "Aa123456",
      // 设置默认 schema 为 star（根据连接字符串 schema=star）
      options: "-c search_path=star",
      // 连接池配置
      max: 20, // 最大连接数
      idleTimeoutMillis: 30000, // 空闲连接超时时间
      connectionTimeoutMillis: 2000, // 连接超时时间
    });
    
    // #region agent log
    // 测试连接并检查表是否存在（在 star schema 中）
    pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'star\' AND table_name IN (\'fact_sales\', \'dim_products\', \'dim_customers\')')
      .then(result => {
        writeLog('lib/analytics-db.ts:62', 'Tables check', { 
          existingTables: result.rows.map((r: { table_name: string }) => r.table_name),
          allTables: result.rows
        }, 'B');
      })
      .catch(err => {
        writeLog('lib/analytics-db.ts:67', 'Tables check failed', { 
          error: err.message 
        }, 'B');
      });
    // #endregion
    // #region agent log
    writeLog('lib/analytics-db.ts:47', 'Pool created', {}, 'A');
    // #endregion
  }
  return pool;
}

/**
 * 执行 SQL 查询
 */
export async function queryAnalyticsDb<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  // #region agent log
  writeLog('lib/analytics-db.ts:70', 'queryAnalyticsDb called', { queryLength: text.length, hasParams: !!params }, 'B');
  // #endregion
  const client = getAnalyticsDb();
  try {
    // #region agent log
    writeLog('lib/analytics-db.ts:74', 'Executing query', { queryPreview: text.substring(0, 100) }, 'B');
    // #endregion
    const result = await client.query(text, params);
    // #region agent log
    writeLog('lib/analytics-db.ts:77', 'Query success', { rowCount: result.rows.length }, 'B');
    // #endregion
    return result.rows as T[];
  } catch (error) {
    // #region agent log
    writeLog('lib/analytics-db.ts:81', 'Query error', {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorCode: (error as { code?: string; detail?: string })?.code,
      errorDetail: (error as { code?: string; detail?: string })?.detail
    }, 'A,B');
    // #endregion
    console.error("数据库查询错误:", error);
    throw error;
  }
}

/**
 * 关闭数据库连接池
 */
export async function closeAnalyticsDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

