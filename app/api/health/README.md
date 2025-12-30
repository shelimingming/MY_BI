# 健康检查 API

## 接口说明

健康检查接口用于监控系统运行状态，可用于负载均衡器、监控系统等场景。

## 端点

- **URL**: `/api/health`
- **方法**: `GET`
- **认证**: 无需认证

## 响应示例

### 成功响应 (200)

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "api": "operational",
    "database": "operational"
  }
}
```

### 错误响应 (500)

```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "error": "Error message"
}
```

## 使用场景

- 容器编排系统的健康检查
- 负载均衡器的健康检查
- 监控系统的状态检查
- CI/CD 流程中的部署验证

