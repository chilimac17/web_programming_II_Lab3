import { GraphQLError } from "graphql";

import {
    artists as artistsCollection,
    albums as albumsCollection,
    listeners as listenersCollection
} from "./config/mongoCollections.js";

import {v4 as uuidv4} from "uuid";

export const resolvers = {

    Query: {
        artists: async (_, args) => {
            const artists_collection = await artistsCollection();
            const artists = await artists_collection.findOne({_id: args._id});
            if (!artists) {
                throw new GraphQLError("Artist not found", {
                    extensions: { code: "ARTIST_NOT_FOUND" }
                });
            }
            return artists;
        },

        albums: async (_, args) => {
const albums_collection = await albumsCollection();
            const albums = await albums_collection.findOne({_id: args._id});
            if (!albums) {
                throw new GraphQLError("Album not found", {
                    extensions: { code: "ALBUM_NOT_FOUND" }
                });
            }
            return albums;
        },

        listeners: async (_, args) => {
const listeners_collection = await listenersCollection();
            const listeners = await listeners_collection.findOne({_id: args._id});
            if (!listeners) {
                throw new GraphQLError("Listener not found", {
                    extensions: { code: "LISTENER_NOT_FOUND" }
                });
            }
            return listeners;
        },

        getArtistById: async (_,  args) => {

        },

        getListenerById: async (_,  args) => {

        },


getAlbumById: async (_,  args) => {

        },

getAlbumsByArtistId: async (_,  args) => {

        },

getListenersByAlbumId: async (_,  args) => {

        },

getAlbumsByGenre: async (_,  args) => {

        },

getArtistsByLabel: async (_,  args) => {

        },

getListenersBySubscription: async (_,  args) => {

        },
getArtistsSignedBetween: async (_,  args) => {

        },
getAlbumsByPromoDateRange: async (_,  args) => {

        },

searchListenersByLastName: async (_,  args) => {

        }
    },
 

    Mutation: {
        addArtist: async (_, args) => {
            
        },
        editArtist: async (_, args) => {

        },
        removeArtist: async (_, args) => {

        },
        addListener: async (_, args) => {

        },
        editListener: async (_, args) => {

        },
        removeListener: async (_, args) => {

        },
        addAlbum: async (_, args) => {

        },
        editAlbum: async (_, args) => {

        },
        removeAlbum: async (_, args) => {

        },
        updateAlbumArtist: async (_, args) => {

        },
        favoriteAlbum: async (_, args) => {

        },
        unfavoriteAlbum: async (_, args) => {

        }
    }
};