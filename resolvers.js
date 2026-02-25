import { GraphQLError } from "graphql";

import {
  artists as artistsCollection,
  albums as albumsCollection,
  listeners as listenersCollection,
} from "./config/mongoCollections.js";

import { v4 as uuidv4 } from "uuid";

export const resolvers = {
  Query: {
    artists: async (_, args) => {
      const artists_collection = await artistsCollection();
      const all_artists = await artists_collection.find({}).toArray();
      if (!all_artists) {
        throw new GraphQLError("Artist not found", {
          extensions: { code: "ARTIST_NOT_FOUND" },
        });
      }
      return all_artists;
    },

    albums: async (_, args) => {
      const albums_collection = await albumsCollection();
      const all_albums = await albums_collection.find({}).toArray();
      if (!all_albums) {
        throw new GraphQLError("Album not found", {
          extensions: { code: "ALBUM_NOT_FOUND" },
        });
      }
      return all_albums;
    },

    listeners: async (_, args) => {
      const listeners_collection = await listenersCollection();
      const all_listeners = await listeners_collection.find({}).toArray();
      if (!all_listeners) {
        throw new GraphQLError("Listener not found", {
          extensions: { code: "LISTENER_NOT_FOUND" },
        });
      }
      return all_listeners;
    },

    getArtistById: async (_, _id) => {
      const artists_collection = await artistsCollection();
      const artists = await artists_collection.findOne({ _id: _id });
      if (!artists) {
        throw new GraphQLError("Artist not found", {
          extensions: { code: "ARTIST_NOT_FOUND" },
        });
      }
      return artists;
    },

    getListenerById: async (_, _id) => {
      const listeners_collection = await listenersCollection();
      const listeners = await listeners_collection.findOne({ _id: _id });
      if (!listeners) {
        throw new GraphQLError("Listener not found", {
          extensions: { code: "LISTENER_NOT_FOUND" },
        });
      }
      return listeners;
    },

    getAlbumById: async (_, _id) => {
      const albums_collection = await albumsCollection();
      const albums = await albums_collection.findOne({ _id: _id });
      if (!albums) {
        throw new GraphQLError("Album not found", {
          extensions: { code: "ALBUM_NOT_FOUND" },
        });
      }
      return albums;
    },

    getAlbumsByArtistId: async (_, artistId) => {
      const artist = await getArtistById(_, { _id: artistId });
      if (!artist) {
        throw new GraphQLError("Artist not found", {
          extensions: { code: "ARTIST_NOT_FOUND" },
        });
      }

      return artist.albums;
    },

    getListenersByAlbumId: async (_, albumId) => {
      const album = await getAlbumById(_, { _id: albumId });

      if (!album) {
        throw new GraphQLError("Album not found", {
          extensions: { code: "ALBUM_NOT_FOUND" },
        });
      }

      return album.listenersWhoFavorited;
    },

    getAlbumsByGenre: async (_, genre) => {
      const albums_collection = await albums();
      const albums = await albums_collection.find({ genre: genre }).toArray();

      if (!albums || albums.length === 0) {
        throw new GraphQLError("No albums found for the specified genre", {
          extensions: { code: "ALBUMS_NOT_FOUND" },
        });
      }

      return albums;
    },

    getArtistsByLabel: async (_, label) => {
      const artists_collection = await artists();
      const artists = await artists_collection.find({ label: label }).toArray();

      if (!artists || artists.length === 0) {
        throw new GraphQLError("No artists found for the specified label", {
          extensions: { code: "ARTISTS_NOT_FOUND" },
        });
      }

      return artists;
    },

    getListenersBySubscription: async (_, tier) => {
      const listeners_collection = await listeners();
      const listeners = await listeners_collection
        .find({ subscription_tier: tier })
        .toArray();

      if (!listeners || listeners.length === 0) {
        throw new GraphQLError(
          "No listeners found for the specified subscription tier",
          {
            extensions: { code: "LISTENERS_NOT_FOUND" },
          },
        );
      }

      return listeners;
    },
    getArtistsSignedBetween: async (_, start, end) => {
      const artists_collection = await artists();
      const artists = await artists_collection
        .find({
          date_signed: { $gte: start, $lte: end },
        })
        .toArray();

      if (!artists || artists.length === 0) {
        throw new GraphQLError(
          "No artists found signed between the specified dates",
          {
            extensions: { code: "ARTISTS_NOT_FOUND" },
          },
        );
      }

      return artists;
    },
    getAlbumsByPromoDateRange: async (_, start, stop) => {
      const albums_collection = await albums();
      const albums = await albums_collection
        .find({
          promo_date: { $gte: start, $lte: stop },
        })
        .toArray();

      if (!albums || albums.length === 0) {
        throw new GraphQLError(
          "No albums found for the specified promo date range",
          {
            extensions: { code: "ALBUMS_NOT_FOUND" },
          },
        );
      }

      return albums;
    },

    searchListenersByLastName: async (_, searchTerm) => {
      const listeners_collection = await listeners();
      //Returns listeners whose last name contains the searchTerm (case-insensitive).
      const listeners = await listeners_collection
        .find({
          last_name: { $regex: searchTerm, $options: "i" },
        })
        .toArray();

      if (!listeners || listeners.length === 0) {
        throw new GraphQLError(
          "No listeners found with the specified last name",
          {
            extensions: { code: "LISTENERS_NOT_FOUND" },
          },
        );
      }

      return listeners;
    },
  },

  Mutation: {
    addArtist: async (
      _,
      stage_name,
      genre,
      label,
      management_email,
      management_phone,
      home_city,
      date_signed,
    ) => {
      let newArtist = {
        stage_name: stage_name,
        genre: genre,
        label: label,
        management_email: management_email,
        management_phone: management_phone,
        home_city: home_city,
        date_signed: date_signed,
        albums: [],
        numOfAlbums: 0,
      };

      const artists_collection = await artists();
      const insertInfo = await artists_collection.insertOne(newArtist);

      if (!insertInfo.acknowledged || !insertInfo.insertedId)
        throw new GraphQLError("ERROR: Could Not Add Artist", {
          extensions: { code: "ARTIST_NOT_ADDED" },
        });

      const newId = insertInfo.insertedId.toString();

      let newArtistPost = await this.getArtistById(newId);

      return newArtistPost;
    },
    editArtist: async (
      _,
      _id,
      stage_name,
      genre,
      label,
      management_email,
      management_phone,
      home_city,
      date_signed,
    ) => {
      let old_artist = await this.getArtistById(_id);

      if (!old_artist) {
        throw new GraphQLError("Artist not found", {
          extensions: { code: "ARTIST_NOT_FOUND" },
        });
      }

      //update fields
      old_artist.stage_name = stage_name || old_artist.stage_name;
      old_artist.genre = genre || old_artist.genre;
      old_artist.label = label || old_artist.label;
      old_artist.management_email =
        management_email || old_artist.management_email;
      old_artist.management_phone =
        management_phone || old_artist.management_phone;
      old_artist.home_city = home_city || old_artist.home_city;
      old_artist.date_signed = date_signed || old_artist.date_signed;

      const artists_collection = await artists();

      const updatedInfo = await artists_collection.findOneAndReplace(
        { _id: _id },
        old_artist,
        { returnDocument: "after" },
      );

      if (!updatedInfo)
        throw new GraphQLError("ERROR: Could Not Update Artist", {
          extensions: { code: "ARTIST_NOT_UPDATED" },
        });

      return updatedInfo;
    },
    removeArtist: async (_, _id) => {
      // # Deletes an artist from MongoDB.
      const artists_collection = await artistsCollection();
      const albums_collection = await albumsCollection();

      const artistToDelete = await artists_collection.findOneAndDelete({
        _id: _id,
      });

      if (!artistToDelete.value) {
        throw new GraphQLError("Artist not found", {
          extensions: { code: "ARTIST_NOT_FOUND" },
        });
      }
      //# Must also set the artist field of all their albums to null.

      await albums_collection.updateMany(
        { artist: _id },
        { $set: { artist: null } },
      );

      return artistToDelete.value;
    },

    addListener: async (
      _,
      first_name,
      last_name,
      email,
      date_of_birth,
      subscription_tier,
    ) => {
      const listeners_collection = await listenersCollection();

      let newListener = {
        first_name: first_name,
        last_name: last_name,
        email: email,
        date_of_birth: date_of_birth,
        subscription_tier: subscription_tier,
      };

      const insertInfo = await listeners_collection.insertOne(newListener);

      if (!insertInfo.acknowledged || !insertInfo.insertedId)
        throw new GraphQLError("ERROR: Could Not Add Listener", {
          extensions: { code: "LISTENER_NOT_ADDED" },
        });

      const newId = insertInfo.insertedId.toString();

      let newListenerPost = await this.getListenerById(newId);

      return newListenerPost;
    },
    editListener: async (
      _,
      _id,
      first_name,
      last_name,
      email,
      date_of_birth,
      subscription_tier,
    ) => {
      let old_listener = await this.getListenerById(_id);

      if (!old_listener) {
        throw new GraphQLError("Listener not found", {
          extensions: { code: "LISTENER_NOT_FOUND" },
        });
      }

      // Update fields
      old_listener.first_name = first_name || old_listener.first_name;
      old_listener.last_name = last_name || old_listener.last_name;
      old_listener.email = email || old_listener.email;
      old_listener.date_of_birth = date_of_birth || old_listener.date_of_birth;
      old_listener.subscription_tier =
        subscription_tier || old_listener.subscription_tier;

      const listeners_collection = await listenersCollection();

      const updatedInfo = await listeners_collection.findOneAndReplace(
        { _id: _id },
        old_listener,
        { returnDocument: "after" },
      );

      if (!updatedInfo)
        throw new GraphQLError("ERROR: Could Not Update Listener");

      return updatedInfo;
    },
    removeListener: async (_, _id) => {
      const listeners_collection = await listenersCollection();
      const listenerToDelete = await listeners_collection.findOneAndDelete({
        _id: _id,
      });

      if (!listenerToDelete.value) {
        throw new GraphQLError("Listener not found", {
          extensions: { code: "LISTENER_NOT_FOUND" },
        });
      }

      return listenerToDelete.value;
    },
    addAlbum: async (
      _,
      title,
      genre,
      track_count,
      artist,
      release_date,
      promo_start,
      promo_end,
    ) => {
      const albums_collection = await albumsCollection();
      let newAlbum = {
        title: title,
        genre: genre,
        track_count: track_count,
        artist: artist,
        release_date: release_date,
        promo_start: promo_start,
        promo_end: promo_end,
        listenersWhoFavorited: [],
      };

      const insertInfo = await albums_collection.insertOne(newAlbum);

      if (!insertInfo.acknowledged || !insertInfo.insertedId)
        throw new GraphQLError("ERROR: Could Not Add Album", {
          extensions: { code: "ALBUM_NOT_ADDED" },
        });
    },
    editAlbum: async (_, _id, title, genre, track_count, artist, release_date, promo_start, promo_end) => {
        let old_album = await this.getAlbumById(_id);

        if (!old_album) {
            throw new GraphQLError("Album not found", {
                extensions: { code: "ALBUM_NOT_FOUND" },
            });
        }

        old_album.title = title || old_album.title;
        old_album.genre = genre || old_album.genre;
        old_album.track_count = track_count || old_album.track_count;
        old_album.artist = artist || old_album.artist;
        old_album.release_date = release_date || old_album.release_date;
        old_album.promo_start = promo_start || old_album.promo_start;
        old_album.promo_end = promo_end || old_album.promo_end;

        const albums_collection = await albumsCollection();

        const updatedInfo = await albums_collection.findOneAndReplace(
            { _id: _id },
            old_album,
            { returnDocument: "after" },
        );

        if (!updatedInfo)
            throw new GraphQLError("ERROR: Could Not Update Album");

        return updatedInfo;
    },
    removeAlbum: async (_, _id) => {
        const albums_collection = await albumsCollection();
        const albumToDelete = await albums_collection.findOneAndDelete({
            _id: _id,
        });

        if (!albumToDelete.value) {
            throw new GraphQLError("Album not found", {
                extensions: { code: "ALBUM_NOT_FOUND" },
            });
        }

        //Must also remove this album’s ID from all listeners’ favorite_albums arrays
        const listeners_collection = await listenersCollection();
        await listeners_collection.updateMany(
            { favorite_albums: _id },
            { $pull: { favorite_albums: _id } }
        );

        return albumToDelete.value;
    },
    updateAlbumArtist: async (_, albumId, artistId) => {
        let album = await getAlbumById(albumId);
        const artist = await getArtistById(artistId);

     
        if (!album) {
            throw new GraphQLError("Album not found", {
                extensions: { code: "ALBUM_NOT_FOUND" },
            });
        }
        if (!artist) {
            throw new GraphQLError("Artist not found", {
                extensions: { code: "ARTIST_NOT_FOUND" },
            });
        }
        album.artist = artistId;

        const albums_collection = await albumsCollection();

        

        const updatedInfo = await albums_collection.findOneAndReplace(
            { _id: albumId },
            album,
            { returnDocument: "after" },
        );

        if (!updatedInfo)
            throw new GraphQLError("ERROR: Could Not Update Album", {
                extensions: { code: "ALBUM_NOT_UPDATED" },
            });
        return updatedInfo;
            
    },
    favoriteAlbum: async (_, listenerId, albumId) => {
        let listener = await getListenerById(listenerId);
        const album = await getAlbumById(albumId);

        if (!listener) {
            throw new GraphQLError("Listener not found", {
                extensions: { code: "LISTENER_NOT_FOUND" },
            });
        }
        if (!album) {
            throw new GraphQLError("Album not found", {
                extensions: { code: "ALBUM_NOT_FOUND" },
            });
        }
        listener.favorite_albums.push(albumId);
        const listeners_collection = await listenersCollection();
        const updatedListener = await listeners_collection.findOneAndUpdate(
            { _id: listenerId },
            { $push: { favorite_albums: albumId } },
            { returnDocument: "after" }
        );
        return updatedListener;
    },
    unfavoriteAlbum: async (_, listenerId, albumId) => {
        let listener = await getListenerById(listenerId);

        if (!listener) {
            throw new GraphQLError("Listener not found", {
                extensions: { code: "LISTENER_NOT_FOUND" },
            });
        }

        listener.favorite_albums = listener.favorite_albums.filter(id => id !== albumId);
        const listeners_collection = await listenersCollection();
        const updatedListener = await listeners_collection.findOneAndUpdate(
            { _id: listenerId },
            { $set: { favorite_albums: listener.favorite_albums } },
            { returnDocument: "after" }
        );
        return updatedListener;
    },
  },
};