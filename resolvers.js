import { GraphQLError } from "graphql";

import {
    artists as artistsCollection,
    albums as albumsCollection,
    listeners as listenersCollection,
} from "./config/mongoCollections.js";

import {v4 as uuidv4} from "uuid";

export const resolvers = {

    Query: {
        artists: async () => {

        }
    }
}