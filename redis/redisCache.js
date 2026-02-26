// You can add and export any helper functions you want here - if you aren't using any, then you can just leave this file as is

import { createClient } from "redis";

const POKEMON_API_URL = "https://pokeapi.co/api/v2/pokemon/";
const POKEMON_ABILITIES_API_URL = "https://pokeapi.co/api/v2/ability/";
const POKEMON_MOVES_API_URL = "https://pokeapi.co/api/v2/move/";

const POKEMON_STATS_HITS_REDIS_KEY = "stats:pokemon:hits";
const POKEMON_STATS_MISSES_REDIS_KEY = "stats:pokemon:misses";
const ABILITY_STATS_HITS_REDIS_KEY = "stats:ability:hits";
const ABILITY_STATS_MISSES_REDIS_KEY = "stats:ability:misses";
const MOVE_STATS_HITS_REDIS_KEY = "stats:move:hits";
const MOVE_STATS_MISSES_REDIS_KEY = "stats:move:misses";

export const client = createClient();

export let errorCheckID = (p_id) => {
  p_id = Number(p_id);
  if (!Number.isInteger(p_id) || p_id <= 0) {
    throw new Error("Invalid id");
  }

  return p_id;
};

export let checkPokemonID = async (p_id, p_redis_key) => {
  let result = false;

  if ((await client.exists(`${p_redis_key}:${p_id}`)) !== 0) {
    result = true;
  }

  return result;
};

export let getPokemonCache = async (p_id, p_redis_key) => {
  let result = undefined;

  if (await checkPokemonID(p_id, p_redis_key)) {
    const data = await client.get(`${p_redis_key}:${p_id}`);
    if (data) {
      result = JSON.parse(data);
    }
  }

  return result;
};

export let getPokemonHistory = async () => {
  let data = await client.lRange("recentlyViewed", 0, 19);
  let final_list = [];

  for (let i = 0; i < data.length; i++) {
    //split
    let id = data[i].split(":")[0];
    let date = data[i].split(":")[1];

    let wrapperData = createWrapper(`/api/pokemon/${id}`, id, "pokemon");
    let cacheData = undefined;

    if (checkPokemonID(id)) {
      wrapperData.cache.hit = true;
      cacheData = await getPokemonCache(id, "pokemon");
    } else {
      cacheData = getPokemonData(id);
    }

    wrapperData.data = cacheData;

    let history = {
      viewedAt: date,
      id: id,
      pokemon: wrapperData,
    };

    final_list.push(history);
  }
  return final_list;
};

export let addPokemonHistory = async (p_id) => {
  const history_entry = `${p_id}:${Date.now()}`;
  const data = await client.lPush("recentlyViewed", history_entry);
};

export let createWrapper = (p_endpoint, p_id, p_redis_key) => {
  let poke_endpoint = undefined;

  if (p_endpoint.startsWith("/api/pokemon/")) {
    poke_endpoint = `${POKEMON_API_URL}${p_id}`;
  } else if (p_endpoint.startsWith("/api/abilities/")) {
    poke_endpoint = `${POKEMON_ABILITIES_API_URL}${p_id}`;
  } else if (p_endpoint.startsWith("/api/moves/")) {
    poke_endpoint = `${POKEMON_MOVES_API_URL}${p_id}`;
  }

  let wrapperData = {
    source: "pokeapi",
    endpoint: poke_endpoint,
    cache: {
      hit: false,
      key: `${p_redis_key}:${p_id}`,
    },
    fetchedAt: new Date().toISOString(),
    data: null,
  };

  return wrapperData;
};

export let addPokemonSummaryToCache = async (p_id, p_summary, p_redis_key) => {
  const key = `${p_redis_key}:${p_id}`;
  const history_entry = `${p_id}:${Date.now()}`;

  if (p_redis_key === "pokemon") {
    await client
      .multi()
      //.set(key, flatten(pokemonSummary, { safe: true }))
      .set(key, JSON.stringify(p_summary), { safe: true })
      .lPush("recentlyViewed", history_entry)
      .exec();
  } else if (p_redis_key === "ability") {
    await client.set(key, JSON.stringify(p_summary), { safe: true });
  } else if (p_redis_key === "move") {
    await client.set(key, JSON.stringify(p_summary), { safe: true });
  }
};

export let getPokemonStats = async () => {
  const hits = await client.get(POKEMON_STATS_HITS_REDIS_KEY);
  const misses = await client.get(POKEMON_STATS_MISSES_REDIS_KEY);

  const stats = {
    hits: hits,
    misses: misses,
  };

  return stats;
};

export let getAbilityStats = async () => {
  const hits = await client.get(ABILITY_STATS_HITS_REDIS_KEY);
  const misses = await client.get(ABILITY_STATS_MISSES_REDIS_KEY);

  const stats = {
    hits: hits,
    misses: misses,
  };

  return stats;
};

export let getMoveStats = async () => {
  const hits = await client.get(MOVE_STATS_HITS_REDIS_KEY);
  const misses = await client.get(MOVE_STATS_MISSES_REDIS_KEY);

  const stats = {
    hits: hits,
    misses: misses,
  };

  return stats;
};
