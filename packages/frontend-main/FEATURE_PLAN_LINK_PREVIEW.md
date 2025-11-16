# Feature Plan: Hover OG Preview Cards for Links

## Todo List

- [ ] **Edge Function**: Create `netlify/edge-functions/link-meta.ts`
  - [ ] Fetch URL and extract OG metadata (og:title, og:description, og:image, etc.)
  - [ ] Handle errors (timeouts, invalid URLs, missing metadata)
  - [ ] Return JSON: `{ title?, description?, image?, url?, siteName?, error? }`
  - [ ] Add route to `netlify.toml`: `[[edge_functions]] function = "link-meta" path = "/link-meta"`
  - [ ] Test locally with `netlify dev`

- [ ] **Composable**: Create `packages/frontend-main/src/composables/useLinkPreview.ts`
  - [ ] Use `@tanstack/vue-query` (follow pattern from `usePost.ts`)
  - [ ] Fetch from `/link-meta?url={encoded_url}`
  - [ ] Cache for 5 minutes (`staleTime: 5 * 60 * 1000`)
  - [ ] TypeScript types: `LinkPreview` interface

- [ ] **Components**: Create preview card components
  - [ ] `src/components/ui/link-preview/LinkPreviewCard.vue`
    - [ ] Use Popover component with hover trigger
    - [ ] Display: image (max 200px), title, description (2-3 lines), site name
    - [ ] Loading/error states
    - [ ] Max width 320px, matches existing Popover styling
  - [ ] `src/components/posts/LinkWithPreview.vue`
    - [ ] Wrapper that renders link + preview card
    - [ ] 500ms hover delay
    - [ ] Pass URL to `useLinkPreview` composable

- [ ] **Integration**: Update `PostMessage.vue`
  - [ ] Replace `<a>` tag with `<LinkWithPreview>` component
  - [ ] Maintain existing link styling and click behavior

- [ ] **Testing**
  - [ ] Test hover behavior (desktop)
  - [ ] Test tap behavior (mobile)
  - [ ] Test various URL types
  - [ ] Test error cases (invalid URL, timeout, missing metadata)

## Architecture

### Edge Function

- **File**: `netlify/edge-functions/link-meta.ts`
- **Endpoint**: `/link-meta?url={encoded_url}`
- **Purpose**: Server-side OG metadata fetching (avoids CORS)
- **Response**: `{ title?, description?, image?, url?, siteName?, error? }`

### Composable

- **File**: `src/composables/useLinkPreview.ts`
- **Pattern**: Follow `usePost.ts` / `useNotifications.ts`
- **Tech**: `@tanstack/vue-query` with 5min cache

### Components

- **LinkPreviewCard**: Preview card UI (uses Popover)
- **LinkWithPreview**: Link wrapper with hover preview
- **PostMessage**: Updated to use `LinkWithPreview`

## File Structure

```
netlify/edge-functions/
  └── link-meta.ts                    # NEW

packages/frontend-main/src/
  ├── composables/
  │   └── useLinkPreview.ts           # NEW
  └── components/
      ├── posts/
      │   ├── PostMessage.vue         # MODIFY
      │   └── LinkWithPreview.vue     # NEW
      └── ui/link-preview/
          └── LinkPreviewCard.vue     # NEW
```

## Data Flow

```
Hover link → 500ms delay → useLinkPreview → Check cache →
Fetch /link-meta → Extract OG tags → Cache response → Display preview
```

## Key Details

- **Hover delay**: 500ms to prevent accidental triggers
- **Caching**: 5min client-side, edge function caching
- **Mobile**: Tap to show (not hover)
- **Error handling**: Graceful degradation (no preview on error)
- **Dependencies**: None new (uses existing `@tanstack/vue-query`, `reka-ui`)

## Estimated Time

- Edge Function: 2-3h
- Composable: 1-2h
- Components: 3-4h
- Integration: 1-2h
- Testing: 2-3h
- **Total**: ~10-14h
