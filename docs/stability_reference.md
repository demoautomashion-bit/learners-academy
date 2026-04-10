# Institutional Stability Reference File (The Blueprint)

This document serves as the **Supreme Law** for all code contributions to "The Learners Academy" portal. Following these patterns ensures that the application remains "Self-Healing" and resistant to crashes, hydration mismatches, and data "glitching."

---

## 1. The Component Safety Pattern (Error Isolation)

**Rule**: No complex UI component should render without a localized `StabilityBoundary`. We never allow a single module failure to crash a portal.

### The Standard Reference implementation:
```tsx
import { StabilityBoundary } from '@/components/stability/stability-boundary'

export function DashboardFeature() {
  return (
    <StabilityBoundary fallback={<ModuleOffline name="Analytics Module" />}>
       <AnalyticsContent />
    </StabilityBoundary>
  )
}
```

### Why this is mandatory:
*   Prevents "White Screen of Death."
*   Allows the user to "Retry" specific parts of the page without refreshing.
*   Isolates `null` pointer errors to the component that caused them.

---

## 2. The Data Contract (Zod Validation)

**Rule**: Every Server Action must validate its output using a Zod schema before it is allowed into the Frontend State. We treat external data as "Radioactive" until validated.

### The Standard Reference implementation:
```typescript
import { z } from 'zod'

const StudentSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  enrolledAt: z.string().datetime(), // Mandatory ISO string
  progress: z.number().min(0).max(100).default(0),
})

export async function getStudentData() {
  const rawData = await db.student.findUnique(...)
  
  // VALIDATE BEFORE RETURNING
  const result = StudentSchema.safeParse(rawData)
  if (!result.success) {
    console.error('DATA_CORRUPTION_DETECTED', result.error)
    return { success: false, error: 'Internal Integrity Error' }
  }
  
  return { success: true, data: result.data }
}
```

---

## 3. The Hydration "Rule of Three"

**Rule**: To prevent "Hydration Mismatch" (glitching on page load), follow these three rules:

1.  **Standardized Dates**: Never use `new Date()` directly in a component's initial render. Use `normalizeISO()` or the `StabilityGuard`.
2.  **Mount Protection**: Use the `useClientOnly` hook for any logic that depends on `window`, `localStorage`, or `sessionStorage`.
3.  **No Randomness**: Never use `Math.random()` or unique IDs during the initial server-pass.

### The Standard Reference implementation:
```tsx
import { useClientOnly } from '@/hooks/use-client-only'

export function RealTimeClock() {
  const isClient = useClientOnly()
  
  // Render a placeholder or null on the server to prevent mismatch
  if (!isClient) return <div className="h-6 w-24 bg-muted animate-pulse rounded" />
  
  return <div>{new Date().toLocaleTimeString()}</div>
}
```

---

## 4. The "Hall of Shame" (Common Crash Patterns)

Avoid these patterns at all costs:

| Pattern | Risk | Global Solution |
| :--- | :--- | :--- |
| `data.map(...)` | Crash if data is `undefined` | Always default: `(data || []).map(...)` |
| `new Date(item.at)` | Hydration Mismatch | Use `normalizeDate` utility in the Data Context. |
| `localStorage.get()` | Server-side crash | Wrap in `useEffect` or `useClientOnly`. |
| `user.profile.name` | Deep null pointer crash | Use optional chaining: `user?.profile?.name ?? 'Guest'` |

---

## 5. Deployment Checklist
Before marking a feature as "Ready," verify:
- [ ] Component is wrapped in an `ErrorBoundary`?
- [ ] Data coming from Server Actions is Zod-validated?
- [ ] No `new Date()` or `Math.random()` in the first render?
- [ ] All deep property access uses optional chaining (`?.`)?

**Failure to follow this guide will result in automated rejection of the feature during the Stability Audit.**
