# AI-Powered Inventory Analytics

## Overview
Implemented AI-powered inventory analysis using Google Gemini AI to provide intelligent insights, predictions, and recommendations for inventory management.

## Features

### 1. AI-Powered Metrics
All inventory statistics are now calculated using AI analysis:

- **Total Components**: Count with trend analysis
- **Inventory Value**: Total value with growth predictions
- **Utilization Rate**: AI-calculated usage patterns
- **Stock Alerts**: Intelligent categorization (Critical, Low, Healthy)
- **Performance Metrics**: Monthly growth, turnover rate, demand trends

### 2. AI Insights
The system provides:

- **Summary**: Brief overview of inventory health
- **Recommendations**: 3-5 actionable suggestions
- **Predictions**: 2-3 forecasts for next month
- **Risk Factors**: 2-3 potential issues to monitor

### 3. Category Analysis
AI analyzes each category:
- Component count
- Total value
- Utilization rate
- Trend analysis

## Implementation

### API Endpoint
**`GET /api/ai/inventory-analytics`**

Fetches comprehensive AI-powered analytics including:
```json
{
  "success": true,
  "analytics": {
    "totalComponents": 0,
    "totalValue": 0,
    "utilizationRate": 78,
    "stockAlerts": {
      "critical": 0,
      "low": 0,
      "healthy": 0
    },
    "performance": {
      "monthlyGrowth": 12,
      "topCategory": "SENSOR",
      "avgTurnoverRate": 45,
      "demandTrend": "stable"
    },
    "aiInsights": {
      "summary": "...",
      "recommendations": [...],
      "predictions": [...],
      "riskFactors": [...]
    },
    "categoryAnalysis": [...]
  }
}
```

### AI Analyzer Module
**`src/lib/ai/inventory-analyzer.ts`**

Functions:
- `analyzeInventoryWithAI()`: Main analysis function
- `getAIInsights()`: Generates AI-powered insights using Gemini
- `calculateMonthlyGrowth()`: Trend calculation
- `calculateTurnoverRate()`: Usage analysis
- `analyzeDemandTrend()`: Demand pattern detection
- `getFallbackAnalytics()`: Fallback if AI fails

### Frontend Integration
**`src/app/inventory/manage/page.tsx`**

- Automatically fetches AI analytics when inventory loads
- Updates stats cards with AI-powered data
- Shows loading state during AI analysis
- Falls back to basic calculations if AI unavailable

## AI Analysis Process

### 1. Data Collection
```typescript
const components = await prisma.component.findMany({
  include: {
    requests: true,
    issuedItems: true,
    stockMovements: true,
  }
})
```

### 2. AI Processing
```typescript
const aiAnalysis = await analyzeInventoryWithAI(components)
```

### 3. Gemini AI Prompt
```
You are an inventory management AI assistant. Analyze the following IoT lab inventory data:

- Total Components: X
- Total Value: ₹Y
- Utilization Rate: Z%
- Stock Alerts: ...
- Top Categories: ...

Provide:
1. summary: Brief overview
2. recommendations: Actionable suggestions
3. predictions: Future forecasts
4. riskFactors: Potential issues
```

### 4. Response Processing
AI response is parsed and structured for display

## Metrics Explained

### Utilization Rate
```
(Total Used / Total Capacity) × 100
```
- **High (>80%)**: Excellent usage, may need more stock
- **Medium (50-80%)**: Healthy balance
- **Low (<50%)**: Underutilized inventory

### Monthly Growth
```
(Recent Components / Older Components) × 100
```
Tracks inventory expansion rate

### Turnover Rate
```
(Total Issued / Total Components) × 100
```
Measures how actively inventory is used

### Demand Trend
Compares recent vs. older request patterns:
- **Increasing**: Recent requests > 120% of older
- **Stable**: Within 80-120% range
- **Decreasing**: Recent requests < 80% of older

## Stock Alert Categories

### Critical (Red)
- Available quantity = 0
- Immediate action required
- Blocks student requests

### Low (Yellow)
- Available < 20% of total
- Restock soon
- May run out within days

### Healthy (Green)
- Available ≥ 20% of total
- No immediate action needed
- Normal operations

## AI Insights Examples

### Summary
```
"Inventory has 45 components with 78% utilization rate. 
3 items need immediate attention. Overall health is good 
with stable demand trends."
```

### Recommendations
```
[
  "Restock ESP32 modules - currently out of stock",
  "Monitor sensor category - showing 85% utilization",
  "Consider bulk purchase for resistors to reduce costs",
  "Review storage locations for better organization",
  "Plan procurement for next month based on trends"
]
```

### Predictions
```
[
  "Sensor demand expected to increase by 15% next month",
  "Microcontroller usage will remain stable",
  "New project season may spike requests in 2 weeks"
]
```

### Risk Factors
```
[
  "3 critical components out of stock",
  "High utilization may lead to shortages",
  "Popular items need proactive restocking"
]
```

## Fallback Mechanism

If AI analysis fails:
1. Uses basic statistical calculations
2. Provides generic recommendations
3. Logs error for debugging
4. Ensures system continues working

```typescript
function getFallbackAnalytics(components: Component[]): InventoryAnalytics {
  // Calculate basic metrics without AI
  // Return structured data
}
```

## Performance

### Optimization
- AI analysis runs asynchronously
- Results cached on frontend
- Fallback ensures no blocking
- Parallel data fetching

### Loading States
- Shows "Analyzing..." during AI processing
- Updates stats when complete
- Smooth transition to AI data

## Environment Setup

### Required
```env
GEMINI_API_KEY=your_api_key_here
```

### Optional
- Falls back to basic analytics if key missing
- Logs warning in console

## Testing

### Test AI Analytics
```bash
# Fetch analytics
curl http://localhost:3000/api/ai/inventory-analytics

# Should return AI-powered insights
```

### Verify Integration
1. Go to Manage Inventory page
2. Check browser console for "🤖 Starting AI-powered inventory analysis..."
3. Stats should update with AI data
4. Look for "✅ AI Analytics loaded" message

## Benefits

### For Lab Assistants
- **Intelligent Insights**: AI-powered recommendations
- **Predictive Analysis**: Forecast future needs
- **Risk Detection**: Early warning of issues
- **Actionable Data**: Clear next steps

### For Management
- **Data-Driven Decisions**: AI-backed insights
- **Trend Analysis**: Understand usage patterns
- **Cost Optimization**: Better procurement planning
- **Resource Planning**: Predict future requirements

## Future Enhancements

1. **Real-time Analysis**: Update insights as data changes
2. **Custom Alerts**: AI-triggered notifications
3. **Seasonal Patterns**: Detect academic calendar trends
4. **Budget Optimization**: AI-powered cost reduction
5. **Supplier Recommendations**: Best vendors for components
6. **Demand Forecasting**: ML-based prediction models
7. **Anomaly Detection**: Unusual usage patterns
8. **Automated Ordering**: AI-triggered purchase orders

## Files Created/Modified

### Created:
- `src/app/api/ai/inventory-analytics/route.ts` - AI analytics API
- `src/lib/ai/inventory-analyzer.ts` - AI analysis logic
- `AI_INVENTORY_ANALYTICS.md` - Documentation

### Modified:
- `src/app/inventory/manage/page.tsx` - Integrated AI analytics

## Status
✅ Complete and ready for testing
🤖 AI-powered analysis active
📊 Real-time insights enabled
