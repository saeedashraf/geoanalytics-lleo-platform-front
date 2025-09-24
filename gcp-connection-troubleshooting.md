# GCP Connection Issues - Troubleshooting Guide

## Common Issues When Connecting Frontend to GCP Cloud Run

### Problem Description
Frontend works initially with GCP Cloud Run API but gets disconnected after some time, while local backend works fine.

## Likely Causes and Solutions

### 1. **Cold Start Issues (Most Common)**

**Problem**: Cloud Run instances go to sleep when not used, causing delays and timeouts.

**Solution**: Implement proper timeout handling and keep-alive requests.

#### Update API Utils (`src/utils/api.ts`)
```typescript
// Add longer timeouts for GCP
const API_TIMEOUT = 60000; // 60 seconds for GCP vs 10 seconds for local

// Update your fetch calls
export const submitAnalysis = async (
  prompt: string,
  credentialsFile?: File
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const formData = new FormData();
    formData.append('prompt', prompt);

    if (credentialsFile) {
      formData.append('credentials', credentialsFile);
    }

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out - GCP instance may be starting up');
    }
    throw error;
  }
};

// Add keep-alive function
export const keepAlive = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.warn('Keep-alive failed:', error);
    return false;
  }
};
```

#### Implement Keep-Alive in Main Component
```typescript
// Add to your main component (src/app/page.tsx)
useEffect(() => {
  // Keep the GCP instance warm
  const keepAliveInterval = setInterval(async () => {
    if (API_BASE_URL.includes('run.app')) { // Only for GCP
      try {
        await keepAlive();
      } catch (error) {
        console.warn('Keep-alive ping failed:', error);
      }
    }
  }, 4 * 60 * 1000); // Ping every 4 minutes

  return () => clearInterval(keepAliveInterval);
}, []);
```

### 2. **CORS and Network Issues**

**Problem**: GCP Cloud Run may have different CORS settings or network configurations.

**Solution**: Ensure proper CORS headers and network handling.

#### Check Your Backend CORS Settings
```python
# If using FastAPI, ensure CORS is properly configured
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-frontend-domain.com",
        "*"  # Remove this in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
```

### 3. **Connection Pooling and Retry Logic**

**Problem**: Network connections may be unstable or reset.

**Solution**: Implement retry logic with exponential backoff.

#### Add Retry Logic
```typescript
// Add to src/utils/api.ts
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }

      if (response.status >= 500 && i < maxRetries) {
        // Server error, retry
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        console.warn(`Request failed with ${response.status}, retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      return response;
    } catch (error) {
      if (i === maxRetries) {
        throw error;
      }

      const delay = Math.pow(2, i) * 1000;
      console.warn(`Request failed, retrying in ${delay}ms...`, error);
      await sleep(delay);
    }
  }

  throw new Error('Max retries exceeded');
};

// Update your API calls to use retry logic
export const checkApiHealth = async () => {
  const response = await fetchWithRetry(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};
```

### 4. **Environment-Specific Configuration**

**Problem**: Different configurations needed for local vs. GCP environments.

**Solution**: Environment-aware API configuration.

#### Update Environment Configuration
```typescript
// Add to src/utils/api.ts
const isProduction = process.env.NODE_ENV === 'production';
const isGCP = API_BASE_URL.includes('run.app');

export const getApiConfig = () => ({
  timeout: isGCP ? 60000 : 10000, // 60s for GCP, 10s for local
  retries: isGCP ? 3 : 1,
  keepAliveInterval: isGCP ? 4 * 60 * 1000 : null, // 4 minutes for GCP
});

// Use in your API calls
const config = getApiConfig();
```

### 5. **Enhanced Error Handling and User Feedback**

**Problem**: Users don't know when GCP instances are cold starting.

**Solution**: Better error messages and loading states.

#### Update Error Handling
```typescript
// Add to your components
const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');

const handleApiError = (error: any) => {
  if (error.message.includes('timed out') || error.message.includes('starting up')) {
    setConnectionStatus('reconnecting');
    showToast({
      type: 'warning',
      title: 'GCP Instance Starting',
      message: 'The server is waking up, please wait 30-60 seconds...',
      duration: 10000
    });
  } else if (error.message.includes('fetch')) {
    setConnectionStatus('disconnected');
    showToast({
      type: 'error',
      title: 'Connection Lost',
      message: 'Lost connection to server. Trying to reconnect...',
      duration: 5000
    });
  }
};

// Add connection status indicator
const ConnectionStatusIndicator = () => {
  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return { color: 'green', icon: Wifi, text: 'Connected' };
      case 'reconnecting':
        return { color: 'yellow', icon: RefreshCw, text: 'Reconnecting...' };
      case 'disconnected':
        return { color: 'red', icon: WifiOff, text: 'Disconnected' };
    }
  };

  const { color, icon: Icon, text } = getStatusConfig();

  return (
    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm bg-${color}-100/90 text-${color}-800 border border-${color}-200`}>
      <Icon className={`w-4 h-4 ${connectionStatus === 'reconnecting' ? 'animate-spin' : ''}`} />
      <span>{text}</span>
    </div>
  );
};
```

### 6. **GCP-Specific Optimizations**

#### Cloud Run Configuration
Ensure your `cloudbuild.yaml` or deployment has proper settings:

```yaml
# Example Cloud Run settings
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: ndvi-analysis-api
  annotations:
    run.googleapis.com/ingress: all
    run.googleapis.com/execution-environment: gen2
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "1"  # Keep at least 1 instance warm
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "false"
        run.googleapis.com/memory: "2Gi"
        run.googleapis.com/timeout: "300"  # 5 minutes timeout
    spec:
      containerConcurrency: 80
      timeoutSeconds: 300
      containers:
      - image: gcr.io/your-project/ndvi-analysis-api
        ports:
        - containerPort: 8080
        env:
        - name: PORT
          value: "8080"
        resources:
          limits:
            cpu: "2"
            memory: "2Gi"
          requests:
            cpu: "1"
            memory: "1Gi"
```

### 7. **Monitoring and Debugging**

#### Add Connection Monitoring
```typescript
// Add to your main component
const [lastSuccessfulPing, setLastSuccessfulPing] = useState<Date | null>(null);

useEffect(() => {
  const monitorConnection = async () => {
    try {
      const isHealthy = await keepAlive();
      if (isHealthy) {
        setLastSuccessfulPing(new Date());
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      console.error('Connection monitoring failed:', error);
    }
  };

  // Monitor every 30 seconds
  const monitorInterval = setInterval(monitorConnection, 30000);

  // Initial check
  monitorConnection();

  return () => clearInterval(monitorInterval);
}, []);
```

## Quick Fixes to Try First

1. **Increase Timeouts**: Change API timeout to 60 seconds
2. **Add Keep-Alive**: Ping your GCP endpoint every 4 minutes
3. **Set Minimum Instances**: Configure Cloud Run to keep at least 1 instance warm
4. **Add Retry Logic**: Retry failed requests with exponential backoff
5. **Better Error Messages**: Show users when GCP is starting up

## Testing Your Fixes

1. Deploy with changes
2. Wait for the service to go cold (15+ minutes of inactivity)
3. Try making a request and observe the behavior
4. Check Cloud Run logs for any errors
5. Monitor connection status in your frontend

## Long-term Solutions

1. **Consider Cloud Run minimum instances** (costs more but eliminates cold starts)
2. **Implement proper health checks** in your backend
3. **Add request queuing** for when the service is starting
4. **Consider using Google Cloud Load Balancer** for better reliability

This should resolve most GCP connection issues you're experiencing!