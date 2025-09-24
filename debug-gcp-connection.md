# Debug GCP Connection Issues

## Current Status
- ✅ **GCP Backend**: Working perfectly (returns 200 OK)
- ❌ **Frontend**: Shows "network error" despite successful backend response

## Debugging Steps

### 1. **Open Browser Developer Tools**
- Press `F12` or right-click → "Inspect"
- Go to **Console** tab
- Look for the detailed logs I just added

### 2. **Check Network Tab**
- Go to **Network** tab in DevTools
- Try submitting an analysis
- Look for the `/analyze` request

**What to check:**
- Does the request show up in Network tab?
- What's the status code? (should be 200)
- What's the response size?
- What's in the Response tab?

### 3. **Console Log Analysis**
With the new debug logs, you should see:

```
Submitting request to: https://ndvi3-analysis-api-258557095482.us-central1.run.app/analyze
Request details: { ... }
Response received: { status: 200, statusText: "OK", ... }
Raw response from GCP: { ... }
```

**If you see the error BEFORE "Response received":**
- Network/connectivity issue
- CORS problem
- Timeout (but you said GCP completes in time)

**If you see the error AFTER "Response received":**
- JSON parsing issue
- Response format problem

### 4. **Quick Test with curl**
Open terminal and test the endpoint directly:

```bash
curl -X GET https://ndvi3-analysis-api-258557095482.us-central1.run.app/health
```

Should return:
```json
{"status": "healthy", "analyzer_initialized": true, ...}
```

### 5. **Check Response Format**
The most likely issue is that your GCP backend is returning a different response format than expected.

**Expected frontend response format:**
```json
{
  "session_id": "some-uuid",
  "query": "your query",
  "user_id": "user_id",
  "status": "completed",
  "created_at": "2025-09-24T14:33:28Z",
  "results": { ... }
}
```

### 6. **Temporary Fix to Test**
Add this to your browser console to test the endpoint directly:

```javascript
// Test GCP endpoint directly
fetch('https://ndvi3-analysis-api-258557095482.us-central1.run.app/health')
  .then(response => {
    console.log('Direct fetch status:', response.status);
    return response.json();
  })
  .then(data => console.log('Direct fetch data:', data))
  .catch(error => console.error('Direct fetch error:', error));
```

### 7. **Common Causes & Solutions**

#### **Cause 1: CORS Issues**
**Symptoms:** Network error immediately, no request in Network tab
**Solution:** Backend needs proper CORS headers

#### **Cause 2: Response Format Mismatch**
**Symptoms:** Response received but JSON parsing fails
**Solution:** Backend returning wrong format

#### **Cause 3: Large Response Size**
**Symptoms:** Request succeeds but fails during download
**Solution:** Response too large for browser

#### **Cause 4: Content-Type Issues**
**Symptoms:** Response received but treated as wrong type
**Solution:** Backend not setting `Content-Type: application/json`

## Next Steps

1. **Run the test** and share what you see in the console
2. **Check Network tab** - does the request appear?
3. **Try the curl command** - does it work?
4. **Share any error messages** from the console

## Potential Quick Fix

If it's a CORS issue, you can try adding this to your backend (temporary test):

```python
# Add to your FastAPI backend
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Expected Output

With the new debug logs, when you submit an analysis, you should see detailed information in the console that will tell us exactly where the failure occurs.

**Most likely issue**: Your GCP backend is returning a different JSON structure than what the frontend expects, causing the JSON parsing to fail even though the HTTP request succeeds.