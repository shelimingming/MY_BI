"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * 区域销售额数据接口
 */
interface RegionSalesData {
  name: string;
  value: number;
  [key: string]: unknown; // 添加索引签名以兼容 recharts 的 ChartDataInput 类型 (Record<string, unknown>)
}

/**
 * 月度趋势数据接口
 */
interface MonthlyTrendData {
  month: string;
  sales: number;
  profit: number;
  profitMargin: number;
}

/**
 * 畅销商品数据接口
 */
interface TopProductData {
  rank: number;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  sales: number;
}

/**
 * 饼图颜色配置
 */
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

/**
 * 数据分析可视化页面
 * 展示三个场景：
 * A. 各区域的销售额占比（饼图）
 * B. 每月的销售趋势和毛利率（折线图 + 柱状图）
 * C. Top 5 畅销商品（排行榜）
 */
export default function AnalyticsPage() {
  const [regionSales, setRegionSales] = useState<RegionSalesData[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取所有数据
  useEffect(() => {
    const fetchAllData = async () => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/295c2f50-af0c-470d-a2d6-3b2ebed82576',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/analytics/page.tsx:70',message:'fetchAllData started',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      setLoading(true);
      setError(null);

      try {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/295c2f50-af0c-470d-a2d6-3b2ebed82576',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/analytics/page.tsx:76',message:'Before fetch calls',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        // 并行获取所有数据
        const [regionRes, monthlyRes, topProductsRes] = await Promise.all([
          fetch("/api/analytics/region-sales"),
          fetch("/api/analytics/monthly-trends"),
          fetch("/api/analytics/top-products"),
        ]);

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/295c2f50-af0c-470d-a2d6-3b2ebed82576',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/analytics/page.tsx:84',message:'Fetch responses received',data:{regionOk:regionRes.ok,monthlyOk:monthlyRes.ok,topProductsOk:topProductsRes.ok,regionStatus:regionRes.status,monthlyStatus:monthlyRes.status,topProductsStatus:topProductsRes.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion

        // 检查响应状态
        if (!regionRes.ok || !monthlyRes.ok || !topProductsRes.ok) {
          // #region agent log
          const regionText = !regionRes.ok ? await regionRes.clone().text().catch(()=>'N/A') : 'OK';
          const monthlyText = !monthlyRes.ok ? await monthlyRes.clone().text().catch(()=>'N/A') : 'OK';
          const topProductsText = !topProductsRes.ok ? await topProductsRes.clone().text().catch(()=>'N/A') : 'OK';
          fetch('http://127.0.0.1:7243/ingest/295c2f50-af0c-470d-a2d6-3b2ebed82576',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/analytics/page.tsx:88',message:'Response not ok',data:{regionStatus:regionRes.status,monthlyStatus:monthlyRes.status,topProductsStatus:topProductsRes.status,regionText,monthlyText,topProductsText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,D'})}).catch(()=>{});
          // #endregion
          throw new Error("获取数据失败");
        }

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/295c2f50-af0c-470d-a2d6-3b2ebed82576',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/analytics/page.tsx:93',message:'Before parsing JSON',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        const [regionData, monthlyData, topProductsData] = await Promise.all([
          regionRes.json(),
          monthlyRes.json(),
          topProductsRes.json(),
        ]);

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/295c2f50-af0c-470d-a2d6-3b2ebed82576',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/analytics/page.tsx:99',message:'JSON parsed',data:{regionDataKeys:Object.keys(regionData),monthlyDataKeys:Object.keys(monthlyData),topProductsDataKeys:Object.keys(topProductsData),hasRegionData:!!regionData.data,hasMonthlyData:!!monthlyData.data,hasTopProductsData:!!topProductsData.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion

        setRegionSales(regionData.data || []);
        setMonthlyTrends(monthlyData.data || []);
        setTopProducts(topProductsData.data || []);
      } catch (err) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/295c2f50-af0c-470d-a2d6-3b2ebed82576',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/analytics/page.tsx:105',message:'Error caught in fetchAllData',data:{errorMessage:err instanceof Error?err.message:String(err),errorName:err instanceof Error?err.name:'Unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
        // #endregion
        console.error("数据加载错误:", err);
        setError(err instanceof Error ? err.message : "未知错误");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // 自定义 Tooltip 格式化函数
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "¥0.00";
    return `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-50 mx-auto" />
          <p className="text-zinc-600 dark:text-zinc-400">加载数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20 max-w-2xl">
          <h2 className="mb-2 text-xl font-semibold text-red-800 dark:text-red-200">
            数据加载失败
          </h2>
          <p className="mb-4 text-red-600 dark:text-red-300">{error}</p>
          {error.includes("does not exist") || error.includes("relation") ? (
            <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
              <h3 className="mb-2 font-semibold text-orange-800 dark:text-orange-200">
                解决方案：
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-orange-700 dark:text-orange-300">
                <li>确保 PostgreSQL 数据库正在运行</li>
                <li>检查数据库连接信息是否正确（host: localhost, port: 5432, database: postgres）</li>
                <li>在数据库中创建以下表：
                  <ul className="ml-6 mt-1 list-disc">
                    <li><code className="rounded bg-orange-100 px-1 dark:bg-orange-900">fact_sales</code></li>
                    <li><code className="rounded bg-orange-100 px-1 dark:bg-orange-900">dim_products</code></li>
                    <li><code className="rounded bg-orange-100 px-1 dark:bg-orange-900">dim_customers</code></li>
                  </ul>
                </li>
                <li>确保表中有数据</li>
              </ol>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            销售数据分析
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            实时数据可视化展示
          </p>
        </div>

        {/* 场景 A: 各区域的销售额占比（饼图） */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-800">
          <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            场景 A: 各区域的销售额占比
          </h2>
          {regionSales.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={regionSales}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {regionSales.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={formatCurrency} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-96 items-center justify-center text-zinc-500">
              暂无数据
            </div>
          )}
        </div>

        {/* 场景 B: 每月的销售趋势和毛利率（折线图 + 柱状图） */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-800">
          <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            场景 B: 每月的销售趋势和毛利率
          </h2>
          {monthlyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: number | undefined, name: string | undefined) => {
                    if (value === undefined || value === null) return "0";
                    if (name === "毛利率 (%)") {
                      return formatPercent(value);
                    }
                    return formatCurrency(value);
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="sales"
                  fill="#8884d8"
                  name="销售额"
                />
                <Bar
                  yAxisId="left"
                  dataKey="profit"
                  fill="#82ca9d"
                  name="利润"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="profitMargin"
                  stroke="#ff7300"
                  strokeWidth={3}
                  name="毛利率 (%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-96 items-center justify-center text-zinc-500">
              暂无数据
            </div>
          )}
        </div>

        {/* 场景 C: Top 5 畅销商品（排行榜） */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-800">
          <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            场景 C: Top 5 畅销商品
          </h2>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {/* 表格展示 */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        排名
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        商品名称
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        分类
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        销售数量
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        销售额
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product) => (
                      <tr
                        key={product.productId}
                        className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-700/50"
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                              product.rank === 1
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : product.rank === 2
                                ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
                                : product.rank === 3
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                                : "bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}
                          >
                            {product.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                          {product.productName}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          {product.category}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-900 dark:text-zinc-50">
                          {product.quantity.toLocaleString("zh-CN")}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                          {formatCurrency(product.sales)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 柱状图展示 */}
              <div className="mt-8">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="productName"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip formatter={formatCurrency} />
                    <Legend />
                    <Bar dataKey="sales" fill="#8884d8" name="销售额" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="flex h-96 items-center justify-center text-zinc-500">
              暂无数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

