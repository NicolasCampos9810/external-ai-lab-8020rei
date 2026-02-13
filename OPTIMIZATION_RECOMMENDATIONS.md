# Platform Optimization Recommendations

## Current Performance Analysis

The platform is well-structured and functional. Here are targeted optimizations that will improve performance without breaking functionality:

---

## 🚀 High Priority Optimizations

### 1. **Weekly Training - Week Counts Query**
**Location**: `app/(app)/weekly/page.tsx`

**Current Issue**: Fetching counts for each week individually (6+ queries)
```typescript
for (const week of WEEKS) {
  const { count } = await supabase
    .from('materials')
    .select('*', { count: 'exact', head: true })
    .eq('week', week)
  weekCounts[week] = count || 0
}
```

**Optimization**: Single query with grouping
```sql
SELECT week, COUNT(*) as count
FROM materials
WHERE week IS NOT NULL
GROUP BY week;
```
**Impact**: Reduces 6-7 queries to 1 query

---

### 2. **Duplicate URL Checking**
**Location**: `lib/actions/materials.ts`

**Current Issue**: Fetches ALL links from database for comparison
```typescript
const { data: existingMaterials } = await supabase
  .from('materials')
  .select('link')
  .not('link', 'is', null)
```

**Optimization**: Use database-level unique constraint (already created in migration)
- The migration `migration-v6-duplicate-prevention.sql` adds a UNIQUE constraint
- Database will automatically reject duplicates
- Remove application-level checking for better performance

**Impact**: Eliminates large data fetch on every upload

---

### 3. **Material Scores View**
**Location**: Database view `material_scores`

**Current Behavior**: Recalculates averages on every query

**Optimization**: Consider materialized view for large datasets
```sql
CREATE MATERIALIZED VIEW material_scores_cached AS
SELECT ...
FROM materials ...;

-- Refresh periodically or after changes
REFRESH MATERIALIZED VIEW material_scores_cached;
```
**Impact**: Faster queries, but requires refresh strategy
**Trade-off**: Slight delay in score updates vs. query performance

---

## 🔧 Medium Priority Optimizations

### 4. **Dashboard - Multiple Material Queries**
**Location**: `app/(app)/dashboard/page.tsx`

**Current**: 3 separate queries for trending, active, and top rated

**Optimization**: Could potentially combine with UNION or fetch once and filter in memory for small datasets

**Impact**: Moderate - only beneficial with many materials (>1000)

---

### 5. **Index Optimization**
**Current Indexes**:
- `idx_materials_link` (on link)
- `idx_materials_essential` (on is_essential WHERE true)
- `idx_profiles_last_login` (on last_login DESC)

**Additional Recommended Indexes**:
```sql
-- For filtering by week + sorting by relevance (Weekly Training page)
CREATE INDEX idx_materials_week_relevance ON materials(week, avg_relevance DESC) WHERE week IS NOT NULL;

-- For filtering by date range (Library date filters)
CREATE INDEX idx_materials_created_at ON materials(created_at DESC);

-- For vote queries by material
CREATE INDEX idx_votes_material_created ON votes(material_id, created_at DESC);
```

**Impact**: Faster filtered queries

---

## ⚡ Low Priority / Future Optimizations

### 6. **Pagination**
**Current**: Loading all results at once

**Future Enhancement**: Add pagination for library view when >50 materials
- Use `limit` and `offset` in queries
- Add "Load More" or page numbers

**Impact**: Significant for large datasets (>100 materials)

---

### 7. **Caching Strategy**
**Consider caching**:
- Category lists (rarely change)
- User profiles (rarely change)
- Material scores (update every 5-10 minutes)

**Tools**: Redis, Next.js `unstable_cache`, or Supabase Realtime

**Impact**: Reduces database load significantly

---

### 8. **Image Optimization**
**If adding images in the future**:
- Use Next.js `<Image>` component
- Implement lazy loading
- Use WebP format
- Add CDN caching

---

## 📊 Monitoring Recommendations

### Add Performance Monitoring:
1. **Query Performance**: Log slow queries (>1s)
2. **Page Load Times**: Track with analytics
3. **Database Metrics**: Monitor connection pool usage

### Supabase Dashboard Checks:
- Review "API Usage" for query patterns
- Check "Database" → "Performance" for slow queries
- Monitor "Auth" for authentication bottlenecks

---

## ✅ Already Optimized

Good practices already in place:
- ✅ Server-side rendering (Next.js App Router)
- ✅ Database indexes on key fields
- ✅ Efficient query structure (select only needed fields)
- ✅ Batch inserts for uploads (50 at a time)
- ✅ Row Level Security (RLS) enabled
- ✅ Proper TypeScript types for safety

---

## 🎯 Recommended Implementation Order

1. **Run database migrations** (fix-user-deletion.sql, find-and-remove-duplicates.sql)
2. **Optimize weekly counts** (single query)
3. **Add recommended indexes** (week+relevance, created_at, votes)
4. **Consider materialized view** (for >500 materials)
5. **Add pagination** (for >100 materials)
6. **Implement caching** (for >1000 materials)

---

## 🔍 Current Platform Status

**Estimated Current Performance** (with ~100 materials, ~50 users):
- Library page load: Fast (~200-400ms)
- Dashboard load: Fast (~300-500ms)
- Weekly Training: Moderate (~400-700ms due to multiple week queries)
- Material Detail: Fast (~150-300ms)
- Upload: Moderate (~500-1000ms for duplicate checking)

**With Optimizations Applied**:
- All pages: < 300ms
- Upload: < 400ms

---

**Platform is currently well-optimized for small-medium scale (< 500 materials, < 100 users). Implement high-priority optimizations when scaling beyond this.**
