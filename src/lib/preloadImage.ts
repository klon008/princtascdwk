/** In-memory cache of successfully decoded image URLs. */
const ready = new Set<string>();
/** In-flight preload promises (dedupe concurrent calls). */
const inflight = new Map<string, Promise<string>>();

/**
 * Preload an image URL into the browser cache and decode it.
 * Resolves with the same URL; rejects on network/decode failure.
 */
export function preloadImage(url: string): Promise<string> {
  if (!url) return Promise.reject(new Error("empty image url"));
  if (ready.has(url)) return Promise.resolve(url);

  const existing = inflight.get(url);
  if (existing) return existing;

  const promise = new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    let settled = false;

    const finishOk = () => {
      if (settled) return;
      settled = true;
      ready.add(url);
      inflight.delete(url);
      resolve(url);
    };

    const finishErr = () => {
      if (settled) return;
      settled = true;
      inflight.delete(url);
      reject(new Error(`failed to load image: ${url}`));
    };

    const afterLoad = () => {
      if (typeof img.decode === "function") {
        img.decode().then(finishOk).catch(finishOk);
      } else {
        finishOk();
      }
    };

    img.onload = afterLoad;
    img.onerror = finishErr;
    img.src = url;

    // Cached: complete may be true before/without a later onload in some browsers.
    if (img.complete && img.naturalWidth > 0) {
      afterLoad();
    }
  });

  inflight.set(url, promise);
  return promise;
}

/** Preload many URLs in parallel; failures do not reject the batch. */
export function preloadImages(urls: Iterable<string>): Promise<PromiseSettledResult<string>[]> {
  const unique = [...new Set([...urls].filter(Boolean))];
  return Promise.allSettled(unique.map((u) => preloadImage(u)));
}

export function isImagePreloaded(url: string): boolean {
  return ready.has(url);
}
