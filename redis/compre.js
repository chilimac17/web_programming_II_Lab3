// redisCache.js
// Redis-backed caching layer for MongoDB query results.
// - Caches only the queries you listed in Redis.
// - Flushes the entire cache on any mutation.
// - Exposes helpers to get/set/invalidate cache with deterministic keys.

import { createClient } from "redis";

export const client = createClient();

// Cache keys (namespaces for readability)
const KEYS = {
  ALL_ARTISTS: "cache:artists",
  ALL_LISTENERS: "cache:listeners",
  ALL_ALBUMS: "cache:albums",
  GET_ARTIST_BY_ID: (id) => `cache:getArtistById:${id}`,
  GET_LISTENER_BY_ID: (id) => `cache:getListenerById:${id}`,
  GET_ALBUM_BY_ID: (id) => `cache:getAlbumById:${id}`,
  GET_ALBUMS_BY_ARTIST_ID: (artistId) => `cache:getAlbumsByArtistId:${artistId}`,
  GET_LISTENERS_BY_ALBUM_ID: (albumId) => `cache:getListenersByAlbumId:${albumId}`,
  GET_ALBUMS_BY_GENRE: (genre) => `cache:getAlbumsByGenre:${genre.toLowerCase()}`,
  GET_ARTISTS_BY_LABEL: (label) => `cache:getArtistsByLabel:${label.toLowerCase()}`,
  GET_LISTENERS_BY_SUBSCRIPTION: (tier) => `cache:getListenersBySubscription:${tier.toLowerCase()}`,
  SEARCH_LISTENERS_BY_LAST_NAME: (term) => `cache:searchListenersByLastName:${term.toLowerCase()}`,
};

// Connect with Redis (handle connection lifecycle outside if needed)
export async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
  }
}

// Cache helpers
export async function cacheGet(key) {
  try {
    const value = await client.get(key);
    if (value) {
      return JSON.parse(value);
    }
    return undefined;
  } catch (err) {
    console.error("Redis cache GET error:", err);
    return undefined;
  }
}

export async function cacheSet(key, value, ttlSeconds = 3600) {
  try {
    // value must be stringifiable
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    console.error("Redis cache SET error:", err);
  }
}

export async function cacheDel(key) {
  try {
    await client.del(key);
  } catch (err) {
    console.error("Redis cache DEL error:", err);
  }
}

// Invalidate the entire cache (used after any mutation)
export async function flushCache() {
  try {
    // If you want to be cautious, target only the known keys/prefixes.
    // Here we perform a broad FLUSHDB-like behavior in a scoped way.
    // WARNING: This will remove all keys in the Redis DB if you flush the whole DB.
    // If you want a safer approach, maintain a prefix list and delete those only.

    // Safer approach: delete known cache keys and scan for matching prefixes.
    const keysToDelete = [
      KEYS.ALL_ARTISTS,
      KEYS.ALL_LISTENERS,
      KEYS.ALL_ALBUMS,
    ];

    // If you want to purge dynamically for mutation-driven prefixes, you can scan keys:
    // const iter = client.scanIterator({ MATCH: "cache:*" });
    // for await (const key of iter) { keysToDelete.push(key); }

    for (const k of keysToDelete) {
      await client.del(k);
    }

    // Optional: if you kept dynamic keys, you could implement a scan-and-delete pass:
    // for await (const key of client.scanIterator({ MATCH: "cache:*" })) { await client.del(key); }

  } catch (err) {
    console.error("Redis cache flush error:", err);
  }
}

// Convenience wrappers for each query type (sync to your needs)
export async function getArtistsFromCache() {
  return await cacheGet(KEYS.ALL_ARTISTS);
}
export async function setArtistsCache(value, ttlSeconds = 3600) {
  await cacheSet(KEYS.ALL_ARTISTS, value, ttlSeconds);
}

export async function getListenersFromCache() {
  return await cacheGet(KEYS.ALL_LISTENERS);
}
export async function setListenersCache(value, ttlSeconds = 3600) {
  await cacheSet(KEYS.ALL_LISTENERS, value, ttlSeconds);
}

export async function getAlbumsFromCache() {
  return await cacheGet(KEYS.ALL_ALBUMS);
}
export async function setAlbumsCache(value, ttlSeconds = 3600) {
  await cacheSet(KEYS.ALL_ALBUMS, value, ttlSeconds);
}

// Per-item/get by id
export async function getArtistByIdFromCache(id) {
  return await cacheGet(KEYS.GET_ARTIST_BY_ID(id));
}
export async function setArtistByIdCache(id, value, ttlSeconds = 3600) {
  await cacheSet(KEYS.GET_ARTIST_BY_ID(id), value, ttlSeconds);
}

export async function getListenerByIdFromCache(id) {
  return await cacheGet(KEYS.GET_LISTENER_BY_ID(id));
}
export async function setListenerByIdCache(id, value, ttlSeconds = 3600) {
  await cacheSet(KEYS.GET_LISTENER_BY_ID(id), value, ttlSeconds);
}

export async function getAlbumByIdFromCache(id) {
  return await cacheGet(KEYS.GET_ALBUM_BY_ID(id));
}
export async function setAlbumByIdCache(id, value, ttlSeconds = 3600) {
  await cacheSet(KEYS.GET_ALBUM_BY_ID(id), value, ttlSeconds);
}

export async function getAlbumsByArtistIdFromCache(artistId) {
  return await cacheGet(KEYS.GET_ALBUMS_BY_ARTIST_ID(artistId));
}
export async function setAlbumsByArtistIdCache(artistId, value, ttlSeconds = 3600) {
  await cacheSet(KEYS.GET_ALBUMS_BY_ARTIST_ID(artistId), value, ttlSeconds);
}

export async function getListenersByAlbumIdFromCache(albumId) {
  return await cacheGet(KEYS.GET_LISTENERS_BY_ALBUM_ID(albumId));
}
export async function setListenersByAlbumIdCache(albumId, value, ttlSeconds = 3600) {
  await cacheSet(KEYS.GET_LISTENERS_BY_ALBUM_ID(albumId), value, ttlSeconds);
}

export async function getAlbumsByGenreFromCache(genre) {
  return await cacheGet(KEYS.GET_ALBUMS_BY_GENRE(genre));
}
export async function setAlbumsByGenreCache(genre, value, ttlSeconds = 3600) {
  await cacheSet(KEYS.GET_ALBUMS_BY_GENRE(genre), value, ttlSeconds);
}

export async function getArtistsByLabelFromCache(label) {
  return await cacheGet(KEYS.GET_ARTISTS_BY_LABEL(label));
}
export async function setArtistsByLabelCache(label, value, ttlSeconds = 3600) {
  await cacheSet(KEYS.GET_ARTISTS_BY_LABEL(label), value, ttlSeconds);
}

export async function getListenersBySubscriptionFromCache(tier) {
  return await cacheGet(KEYS.GET_LISTENERS_BY_SUBSCRIPTION(tier));
}
export async function setListenersBySubscriptionCache(tier, value, ttlSeconds = 3600) {
  await cacheSet(KEYS.GET_LISTENERS_BY_SUBSCRIPTION(tier), value, ttlSeconds);
}

export async function getListenersByLastNameSearchFromCache(term) {
  return await cacheGet(KEYS.SEARCH_LISTENERS_BY_LAST_NAME(term));
}
export async function setListenersByLastNameSearchCache(term, value, ttlSeconds = 3600) {
  await cacheSet(KEYS.SEARCH_LISTENERS_BY_LAST_NAME(term), value, ttlSeconds);
}
