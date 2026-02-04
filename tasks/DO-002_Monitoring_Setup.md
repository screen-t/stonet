# TASK: DO-002 - Monitoring Setup

**Assigned To:** DevOps Engineer  
**Priority:** MEDIUM  
**Estimate:** 8 hours  
**Deadline:** February 8, 2026  
**Status:** Not Started  
**Dependencies:** DO-001 (CI/CD Pipeline Setup)  
**Created:** February 5, 2026

---

## Objective

Set up comprehensive monitoring, error tracking, and alerting systems for the application to ensure high availability, performance monitoring, and quick incident response.

## Prerequisites

- DO-001 (CI/CD Pipeline Setup) completed
- Understanding of monitoring best practices
- Knowledge of error tracking systems
- Familiarity with uptime monitoring
- Access to monitoring service accounts

## Instructions

### Step 1: Error Tracking with Sentry

#### Frontend Setup (React)

1. **Install Sentry SDK:**
```bash
cd frontend
npm install @sentry/react @sentry/tracing
```

2. **Configure Sentry (src/lib/sentry.ts):**
```typescript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect
      ),
    }),
  ],
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  beforeSend(event) {
    // Filter out development errors
    if (import.meta.env.DEV) {
      return null;
    }
    return event;
  },
});
```

3. **Initialize in main.tsx:**
```typescript
import './lib/sentry';
```

4. **Add Error Boundary:**
```typescript
import { ErrorBoundary } from "@sentry/react";

function App() {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <YourApp />
    </ErrorBoundary>
  );
}
```

#### Backend Setup (Python/FastAPI)

1. **Install Sentry SDK:**
```bash
cd backend
pip install sentry-sdk[fastapi]
```

2. **Configure Sentry (app/lib/monitoring.py):**
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlAlchemyIntegration
import os

def init_sentry():
    sentry_sdk.init(
        dsn=os.getenv("SENTRY_DSN"),
        environment=os.getenv("ENVIRONMENT", "development"),
        integrations=[
            FastApiIntegration(auto_enabling_integrations=False),
            SqlAlchemyIntegration(),
        ],
        traces_sample_rate=0.1 if os.getenv("ENVIRONMENT") == "production" else 1.0,
        before_send=filter_sentry_events,
    )

def filter_sentry_events(event, hint):
    # Filter out known non-critical errors
    if event.get('logger') == 'uvicorn.access':
        return None
    return event
```

3. **Initialize in main.py:**
```python
from app.lib.monitoring import init_sentry

init_sentry()
```

### Step 2: Performance Monitoring

#### Application Performance Monitoring (APM)

1. **Frontend Performance Tracking:**
```typescript
// src/lib/performance.ts
export const trackPageLoad = (pageName: string) => {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    const loadTime = end - start;
    
    // Track with Sentry
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `Page ${pageName} loaded in ${loadTime}ms`,
      level: 'info',
      data: { pageName, loadTime }
    });
    
    // Send to analytics if available
    if (window.gtag) {
      window.gtag('event', 'page_load_time', {
        page_name: pageName,
        load_time: Math.round(loadTime)
      });
    }
  };
};

// Usage in components
const Profile = () => {
  useEffect(() => {
    const trackLoad = trackPageLoad('Profile');
    return trackLoad;
  }, []);
};
```

2. **API Performance Monitoring:**
```python
# app/middleware/performance.py
import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class PerformanceMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        
        # Log slow requests
        if process_time > 1.0:  # 1 second threshold
            logger.warning(
                f"Slow request: {request.method} {request.url.path} "
                f"took {process_time:.2f}s"
            )
        
        # Add performance header
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
```

### Step 3: Uptime Monitoring

#### Setup with UptimeRobot (Free tier)

1. **Create monitoring checks for:**
   - Frontend application (https://yourapp.com)
   - Backend API health endpoint (https://api.yourapp.com/health)
   - Database connectivity
   - Authentication endpoints

2. **Configure alerts:**
   - Email notifications
   - Slack webhook (if available)
   - SMS for critical endpoints

3. **Health Check Endpoint (backend):**
```python
from fastapi import APIRouter, HTTPException
from app.lib.supabase import get_supabase_client
import asyncio

health_router = APIRouter()

@health_router.get("/health")
async def health_check():
    checks = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {}
    }
    
    # Database check
    try:
        supabase = get_supabase_client()
        result = supabase.table('profiles').select('id').limit(1).execute()
        checks["checks"]["database"] = "healthy"
    except Exception as e:
        checks["checks"]["database"] = f"unhealthy: {str(e)}"
        checks["status"] = "unhealthy"
    
    # API responsiveness check
    start_time = time.time()
    # Simulate a lightweight operation
    await asyncio.sleep(0.01)
    response_time = time.time() - start_time
    
    checks["checks"]["api_response_time"] = f"{response_time:.3f}s"
    
    if checks["status"] == "unhealthy":
        raise HTTPException(status_code=503, detail=checks)
    
    return checks

@health_router.get("/health/detailed")
async def detailed_health_check():
    # More comprehensive health check for internal use
    checks = await run_detailed_health_checks()
    return checks
```

### Step 4: Logging Configuration

#### Structured Logging Setup

1. **Backend Logging (app/lib/logger.py):**
```python
import logging
import json
from datetime import datetime
from typing import Dict, Any

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_obj = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        if hasattr(record, 'user_id'):
            log_obj['user_id'] = record.user_id
        
        if hasattr(record, 'request_id'):
            log_obj['request_id'] = record.request_id
            
        if record.exc_info:
            log_obj['exception'] = self.formatException(record.exc_info)
            
        return json.dumps(log_obj)

def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    
    logger.addHandler(handler)
    return logger
```

2. **Request Logging Middleware:**
```python
import uuid
from contextvars import ContextVar
from fastapi import Request

request_id_contextvar: ContextVar[str] = ContextVar('request_id')

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request_id_contextvar.set(request_id)
        
        logger.info(
            "Request started",
            extra={
                'request_id': request_id,
                'method': request.method,
                'url': str(request.url),
                'headers': dict(request.headers)
            }
        )
        
        response = await call_next(request)
        
        logger.info(
            "Request completed",
            extra={
                'request_id': request_id,
                'status_code': response.status_code
            }
        )
        
        return response
```

### Step 5: Environment-Specific Configuration

#### Production Environment Variables

```bash
# .env.production
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
ENVIRONMENT=production
LOG_LEVEL=INFO
MONITORING_ENABLED=true
UPTIME_ROBOT_API_KEY=your-uptimerobot-key
```

#### Development Environment

```bash
# .env.development  
SENTRY_DSN=https://your-dev-sentry-dsn@sentry.io/dev-project-id
ENVIRONMENT=development
LOG_LEVEL=DEBUG
MONITORING_ENABLED=false
```

### Step 6: Alert Configuration

#### Slack Integration (Optional)

1. **Create Slack webhook for alerts**
2. **Configure Sentry Slack integration**
3. **Setup UptimeRobot Slack notifications**

#### Custom Alert Logic

```python
# app/lib/alerts.py
import requests
import os
from typing import Dict, Any

class AlertManager:
    def __init__(self):
        self.slack_webhook = os.getenv('SLACK_WEBHOOK_URL')
        self.email_alerts = os.getenv('ALERT_EMAIL_ENABLED', 'false') == 'true'
    
    async def send_critical_alert(self, title: str, message: str, context: Dict[str, Any] = None):
        if self.slack_webhook:
            await self._send_slack_alert(title, message, context, color='danger')
    
    async def send_warning_alert(self, title: str, message: str, context: Dict[str, Any] = None):
        if self.slack_webhook:
            await self._send_slack_alert(title, message, context, color='warning')
    
    async def _send_slack_alert(self, title: str, message: str, context: Dict, color: str):
        payload = {
            "attachments": [{
                "color": color,
                "title": title,
                "text": message,
                "fields": [
                    {"title": key, "value": str(value), "short": True}
                    for key, value in (context or {}).items()
                ],
                "footer": "Stonet Monitoring",
                "ts": int(time.time())
            }]
        }
        
        try:
            requests.post(self.slack_webhook, json=payload, timeout=10)
        except Exception as e:
            logger.error(f"Failed to send Slack alert: {e}")
```

### Step 7: Dashboard Setup

#### Simple Monitoring Dashboard

Create a simple HTML dashboard for internal monitoring:

```html
<!-- monitoring/dashboard.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Stonet Monitoring Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .status-green { color: green; }
        .status-red { color: red; }
        .metric-card { 
            border: 1px solid #ccc; 
            padding: 1rem; 
            margin: 0.5rem; 
            border-radius: 4px; 
        }
    </style>
</head>
<body>
    <h1>Stonet System Status</h1>
    
    <div id="system-status">
        <div class="metric-card">
            <h3>API Health</h3>
            <p id="api-status" class="status-loading">Checking...</p>
        </div>
        
        <div class="metric-card">
            <h3>Database Status</h3>
            <p id="db-status" class="status-loading">Checking...</p>
        </div>
        
        <div class="metric-card">
            <h3>Response Time</h3>
            <p id="response-time" class="status-loading">Measuring...</p>
        </div>
    </div>
    
    <script>
        // Simple JavaScript to check endpoints
        async function checkHealth() {
            try {
                const start = Date.now();
                const response = await fetch('/api/health');
                const end = Date.now();
                const data = await response.json();
                
                document.getElementById('api-status').textContent = 
                    data.status === 'healthy' ? '✅ Healthy' : '❌ Unhealthy';
                document.getElementById('api-status').className = 
                    data.status === 'healthy' ? 'status-green' : 'status-red';
                
                document.getElementById('db-status').textContent = 
                    data.checks.database === 'healthy' ? '✅ Connected' : '❌ Error';
                document.getElementById('db-status').className = 
                    data.checks.database === 'healthy' ? 'status-green' : 'status-red';
                
                document.getElementById('response-time').textContent = 
                    `${end - start}ms`;
            } catch (error) {
                document.getElementById('api-status').textContent = '❌ Error';
                document.getElementById('api-status').className = 'status-red';
            }
        }
        
        // Check health every 30 seconds
        checkHealth();
        setInterval(checkHealth, 30000);
    </script>
</body>
</html>
```

## Deliverables

- [ ] Sentry error tracking configured for frontend and backend
- [ ] Performance monitoring middleware implemented
- [ ] Uptime monitoring setup with alerts
- [ ] Structured logging configuration
- [ ] Health check endpoints created
- [ ] Alert system configured
- [ ] Basic monitoring dashboard
- [ ] Environment-specific configurations
- [ ] Documentation for monitoring setup

## Acceptance Criteria

1. **Error Tracking:**
   - All JavaScript errors captured and sent to Sentry
   - Backend exceptions properly logged and tracked
   - Error alerts configured for critical issues

2. **Performance Monitoring:**
   - API response times tracked
   - Slow queries identified and logged
   - Frontend performance metrics collected

3. **Uptime Monitoring:**
   - All critical endpoints monitored
   - Alerts configured for downtime
   - Health checks provide meaningful status

4. **Logging:**
   - Structured logs in JSON format
   - Request tracing implemented
   - Appropriate log levels configured

## Monitoring Checklist

- [ ] Sentry projects created for dev/staging/prod
- [ ] UptimeRobot monitors configured
- [ ] Slack/email alerts tested
- [ ] Health endpoints responding correctly
- [ ] Performance thresholds configured
- [ ] Log aggregation working
- [ ] Dashboard accessible
- [ ] Alert escalation tested

## Questions or Issues?

Contact:
- **Project Manager:** Daniel
- **DevOps Lead:** [TBD]
- **Technical Lead:** [TBD]

## Next Steps After Completion

1. Test all monitoring systems
2. Configure production alerts
3. Set up log retention policies  
4. Train team on monitoring tools
5. Create runbook for incident response

---

**Status Updates:**
- [ ] Started: _________
- [ ] Sentry Setup: _________
- [ ] Performance Monitoring: _________
- [ ] Uptime Monitoring: _________
- [ ] Logging Configuration: _________
- [ ] Alert System: _________
- [ ] Dashboard Creation: _________
- [ ] Testing Complete: _________
- [ ] Completed: _________