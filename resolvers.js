import { GraphQLError } from "graphql";
import methods from "./helpers.js";
import {
  artists as artistsCollection,
  albums as albumsCollection,
  listeners as listenersCollection,
} from "./config/mongoCollections.js";

import { v4 as uuidv4 } from "uuid";

export const resolvers = {

  //Queries********************************************************************
  Query: {
    artists: async () => {
      const artists_collection = await artistsCollection();
      const all_artists = await artists_collection.find({}).toArray();
      if (!all_artists) {
        throw new GraphQLError("Artist not found", {
          extensions: { code: "ARTIST_NOT_FOUND" },
        });
      }
      return all_artists;
    },


    listeners: async () => {
      const listeners_collection = await listenersCollection();
      const all_listeners = await listeners_collection.find({}).toArray();
      if (!all_listeners) {
        throw new GraphQLError("Listener not found", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
      return all_listeners;
    },

    albums: async () => {
      const albums_collection = await albumsCollection();
      const all_albums = await albums_collection.find({}).toArray();
      if (!all_albums) {
        throw new GraphQLError("Album not found", {
          extensions: { code: "ALBUM_NOT_FOUND" },
        });
      }
      return all_albums;
    },

    getArtistById: async (_, args) => {
        args._id = methods.errorCheckString(args._id);
      const artists_collection = await artistsCollection();
      const artists = await artists_collection.findOne({ _id: args._id });
      if (!artists) {
        throw new GraphQLError("Artist not found", {
          extensions: { code: "ARTIST_NOT_FOUND" },
        });
      }
      return artists;
    },

    getListenerById: async (_, args) => {
        args._id = methods.errorCheckString(args._id);
      const listeners_collection = await listenersCollection();
      const listeners = await listeners_collection.findOne({ _id: args._id });
      if (!listeners) {
        throw new GraphQLError("Listener not found", {
          extensions: { code: "LISTENER_NOT_FOUND" },
        });
      }
      return listeners;
    },

    getAlbumById: async (_, args) => {
        args._id = methods.errorCheckString(args._id);
      const albums_collection = await albumsCollection();
      const albums = await albums_collection.findOne({ _id: args._id });
      if (!albums) {
        throw new GraphQLError("Album not found", {
          extensions: { code: "ALBUM_NOT_FOUND" },
        });
      }
      return albums;
    },
    getAlbumsByArtistId: async (_, artistId) => {
      artistId = methods.errorCheckString(artistId);
      const artist = await getArtistById(_, { _id: artistId });
      if (!artist) {
        throw new GraphQLError("Artist not found", {
          extensions: { code: "ARTIST_NOT_FOUND" },
        });
      }

      return artist.albums;
    },

    getListenersByAlbumId: async (_, albumId) => {
        albumId = methods.errorCheckString(albumId);
      const album = await getAlbumById(_, { _id: albumId });

      if (!album) {
        throw new GraphQLError("Album not found", {
          extensions: { code: "ALBUM_NOT_FOUND" },
        });
      }

      return album.listenersWhoFavorited;
    },

    getAlbumsByGenre: async (_, genre) => {
        genre = methods.errorCheckString(genre);
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
        label = methods.errorCheckString(label);
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
        tier = methods.errorCheckString(tier);
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
        //promo_start must be before promo_end.
        if (start >= stop) {
            throw new GraphQLError("Invalid promo date range: start date must be before end date", {
                extensions: { code: "INVALID_PROMO_DATE_RANGE" },
            });
        }

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


  //Type Resolvers********************************************************************

     Artist:{
      albums: async (parentValue) => {
      const albums_collection = await albumsCollection();
      return await albums_collection
        .find({ artist: parentValue._id })
        .toArray();
    },
      numOfAlbums: async (parentValue) => {
        //console.log("parentValue:");
       // console.log(parentValue);
        const albums_collection = await albumsCollection();
        let numOfAlbums = await albums_collection.countDocuments({
          artist: parentValue._id
        })

        return numOfAlbums;
      },
  },
  
    Listener:{
      favorite_albums: async (parentValue) => {
        const albums_collection = await albumsCollection();
      return await albums_collection
        .find({ _id: parentValue.favorite_albums._id })
        .toArray();
      },
      numOfFavoriteAlbums: async (parentValue) => {
const listeners_collection = await listenersCollection();
  const listener = await listeners_collection.findOne({ _id: parentValue._id });
  if (!listener) {      
      throw new GraphQLError("Listener not found", {
        extensions: { code: "LISTENER_NOT_FOUND" },
      });
  }
  return listener.favorite_albums.length;
    }
  },
  

  Album:{
    artist: async (parentValue) => {
      const artists_collection = await artistsCollection();
      return await artists_collection.findOne({ _id: parentValue.artist });
    },

      listenersWhoFavorited: async (parentValue) => {
        const listeners_collection = await listenersCollection();
      return await listeners_collection
        .find({ favorite_albums: parentValue._id })
        .toArray();
      },

                                                                                                
      numOfListenersWhoFavorited: async (parentValue) => {
      const albums_collection = await albumsCollection();
      const album = await albums_collection.findOne({ _id: parentValue._id });
  if (!album) {      
      throw new GraphQLError("Album not found", {
        extensions: { code: "ALBUM_NOT_FOUND" },
      });
  }
  return album.listenersWhoFavorited.length;
    },
  },

  
 // Mutations********************************************************************
  Mutation: {
    addArtist: async (
      _,
      args,
    ) => {
        let { stage_name, genre, label, management_email, management_phone, home_city, date_signed } = args;
        stage_name = methods.errorCheckString(stage_name);
       genre = methods.errorCheckString(genre);
         label = methods.errorCheckString(label);
        management_email = methods.checkEmail(management_email);
            // TODO MC
           // management_phone = methods.errorCheckPhoneNumber(management_phone);
        home_city = methods.errorCheckString(home_city);
       date_signed = methods.errorCheckDates(date_signed);

         



      let newArtist = {
        _id: uuidv4(),
        stage_name: stage_name,
        genre: genre,
        label: label,
        management_email: management_email,
        management_phone: management_phone,
        home_city: home_city,
        date_signed: date_signed
      };

      //console.log("newArtist:");
      //console.log(newArtist);

      const artists_collection = await artistsCollection();
      const insertInfo = await artists_collection.insertOne(newArtist);
//console.log("insertInfo:");
//console.log(insertInfo);
      if (!insertInfo.acknowledged || !insertInfo.insertedId)
        throw new GraphQLError("ERROR: Could Not Add Artist", {
          extensions: { code: "ARTIST_NOT_ADDED" },
        });

      const newId = insertInfo.insertedId.toString();

      let newArtistPost = await artists_collection.findOne({ _id: newId });

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
      _id = methods.errorCheckString(_id);
      stage_name = methods.errorCheckString(stage_name);
      genre = methods.errorCheckString(genre);
            label = methods.errorCheckString(label);
            management_email = methods.checkEmail(management_email);
            // TODO MC
           // management_phone = methods.errorCheckPhoneNumber(management_phone);
           home_city = methods.errorCheckString(home_city);
         date_signed = methods.errorCheckDates(date_signed);


      let old_artist = await this.getArtistById(_id);
      date_signed = methods.errorCheckDates(date_signed);

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
        _id = methods.errorCheckString(_id);
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
        first_name = methods.errorCheckString(first_name);
        last_name = methods.errorCheckString(last_name);
        email = methods.checkEmail(email);
        date_of_birth = methods.errorCheckDates(date_of_birth);

        //A listener must be a reasonable age (use min 13, max 120).

        const currentYear = new Date().getFullYear();
        const birthYear = new Date(date_of_birth).getFullYear();
        const age = currentYear - birthYear;

        if (age < 13 || age > 120) {
            throw new GraphQLError("Invalid date_of_birth: Listener must be between 13 and 120 years old.", {
                extensions: { code: "INVALID_DATE_OF_BIRTH" },
            });
        }

        subscription_tier = methods.errorCheckString(subscription_tier);
        const validTiers = ["FREE", "PREMIUM"];

        if (!validTiers.includes(subscription_tier)) {
            throw new GraphQLError("Invalid subscription_tier: Must be either 'FREE' or 'PREMIUM'", {
                extensions: { code: "INVALID_SUBSCRIPTION_TIER" },
            });
        }

      const listeners_collection = await listenersCollection();

      let newListener = {
        _id: uuidv4(),
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
        _id = methods.errorCheckString(_id);
        first_name = methods.errorCheckString(first_name);
        last_name = methods.errorCheckString(last_name);
        email = methods.checkEmail(email);
        date_of_birth = methods.errorCheckDates(date_of_birth);

        //A listener must be a reasonable age (use min 13, max 120).

        const currentYear = new Date().getFullYear();
        const birthYear = new Date(date_of_birth).getFullYear();
        const age = currentYear - birthYear;

        if (age < 13 || age > 120) {
            throw new GraphQLError("Invalid date_of_birth: Listener must be between 13 and 120 years old.", {
                extensions: { code: "INVALID_DATE_OF_BIRTH" },
            });
        }

        subscription_tier = methods.errorCheckString(subscription_tier);
        const validTiers = ["FREE", "PREMIUM"];

        if (!validTiers.includes(subscription_tier)) {
            throw new GraphQLError("Invalid subscription_tier: Must be either 'FREE' or 'PREMIUM'", {
                extensions: { code: "INVALID_SUBSCRIPTION_TIER" },
            });
        }


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
        _id = methods.errorCheckString(_id);
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
        title = methods.errorCheckString(title);
        genre = methods.errorCheckString(genre);
        //TODO MC
        //track_count = methods.errorCheckTrackCount(track_count);
        artist = methods.errorCheckString(artist);
        release_date = methods.errorCheckDates(release_date);
        promo_start = methods.errorCheckDates(promo_start);
        promo_end = methods.errorCheckDates(promo_end);

        if (promo_start >= promo_end) {
            throw new GraphQLError("Invalid promo date range: start date must be before end date", {
                extensions: { code: "INVALID_PROMO_DATE_RANGE" },
            });
        }


      const albums_collection = await albumsCollection();
      let newAlbum = {
        _id: uuidv4(),
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
        _id = methods.errorCheckString(_id);
        title = methods.errorCheckString(title);
        genre = methods.errorCheckString(genre);
        //TODO MC
        //track_count = methods.errorCheckTrackCount(track_count);
        artist = methods.errorCheckString(artist);
        release_date = methods.errorCheckDates(release_date);
        promo_start = methods.errorCheckDates(promo_start);
        promo_end = methods.errorCheckDates(promo_end);
        
        if (promo_start >= promo_end) {
            throw new GraphQLError("Invalid promo date range: start date must be before end date", {
                extensions: { code: "INVALID_PROMO_DATE_RANGE" },
            });
        }


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
        _id = methods.errorCheckString(_id);
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
        albumId = methods.errorCheckString(albumId);
        artistId = methods.errorCheckString(artistId);
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
        listenerId = methods.errorCheckString(listenerId);
        albumId = methods.errorCheckString(albumId);

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
        listenerId = methods.errorCheckString(listenerId);
        albumId = methods.errorCheckString(albumId);
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