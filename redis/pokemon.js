//import express, express router as shown in lecture code
import { Router } from "express";
import poke_doc from "../data/pokeAPI.js";
import { client } from "../data/redisCache.js";
import * as redisServer from "../data/redisCache.js";

const router = Router();

router.route("/pokemon/history").get(async (req, res) => {
  try {
    const history_list = await redisServer.getPokemonHistory();
    return res.json(history_list);
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
});
router.route("/pokemon/:id").get(async (req, res) => {
  //code here for GET
  try {
    redisServer.errorCheckID(req.params.id);

    const pokemon = await poke_doc.getPokemonData(req.params.id);

    if (!pokemon) {
      return res.status(404).json({ error: "Not Found" });
    }

    await redisServer.addPokemonSummaryToCache(pokemon.id, pokemon, "pokemon");
    await client.incr("stats:pokemon:misses");
    return res.json({
      source: req.wrapperData.source,
      endpoint: req.wrapperData.endpoint,
      cache: {
        hit: req.wrapperData.cache.hit,
        key: req.wrapperData.cache.key,
      },
      fetchedAt: req.wrapperData.fetchedAt,
      data: pokemon,
    });
  } catch (e) {
    console.log(e);
    return res.status(404).json({ error: e.message });
  }
});

router.route("/abilities/:id").get(async (req, res) => {
  //code here for GET
  try {
    redisServer.errorCheckID(req.params.id);
    const pokemon = await poke_doc.getPokemonAbilitiesData(req.params.id);

    await redisServer.addPokemonSummaryToCache(pokemon.id, pokemon, "ability");
    await client.incr("stats:ability:misses");
    return res.json({
      source: req.wrapperData.source,
      endpoint: req.wrapperData.endpoint,
      cache: {
        hit: req.wrapperData.cache.hit,
        key: req.wrapperData.cache.key,
      },
      fetchedAt: req.wrapperData.fetchedAt,
      data: pokemon,
    });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
});

router.route("/moves/:id").get(async (req, res) => {
  try {
    redisServer.errorCheckID(req.params.id);
    const pokemon = await poke_doc.getPokemonMovesData(req.params.id);
    await redisServer.addPokemonSummaryToCache(pokemon.id, pokemon, "move");
    await client.incr("stats:move:misses");
    return res.json({
      source: req.wrapperData.source,
      endpoint: req.wrapperData.endpoint,
      cache: {
        hit: req.wrapperData.cache.hit,
        key: req.wrapperData.cache.key,
      },
      fetchedAt: req.wrapperData.fetchedAt,
      data: pokemon,
    });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
});

router.route("/cache/stats").get(async (req, res) => {
  try {
    const pokemon_stats = await redisServer.getPokemonStats();
    const ability_stats = await redisServer.getAbilityStats();
    const move_stats = await redisServer.getMoveStats();

    return res.json({
      pokemon: { hits: pokemon_stats.hits, misses: pokemon_stats.misses },
      abilities: { hits: ability_stats.hits, misses: ability_stats.misses },
      moves: { hits: move_stats.hits, misses: move_stats.misses },
    });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
});

export default router;
