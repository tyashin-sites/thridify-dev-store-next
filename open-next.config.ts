import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';

// queue: without it OpenNext uses a dummy queue and stale ISR pages are never
// regenerated (x-nextjs-cache: STALE until the next deploy). Needs the
// NEXT_CACHE_DO_QUEUE Durable Object + WORKER_SELF_REFERENCE binding in
// wrangler.jsonc — tyashin-platform CLAUDE.md §12c-bis.
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  queue: doQueue,
});
