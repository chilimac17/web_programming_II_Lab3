export const typeDefs = `#graphql

type Query {
    artists: [Artist]
    listeners: [Listener]
    albums: [Album]
}

type Artist {
  _id: String
  stage_name: String
  genre: String
  label: String
  management_email: String
  management_phone: String
  home_city: String
  date_signed: String
  albums: [Album]
  numOfAlbums: Int
}

type Listener {
  _id: String
  first_name: String
  last_name: String
  email: String
  date_of_birth: String
  subscription_tier: String
  favorite_albums: [Album]
  numOfFavoriteAlbums: Int
}

type Album {
  _id: String
  title: String
  genre: String
  track_count: Int
  artist: Artist
  release_date: String
  promo_start: String
  promo_end: String
  listenersWhoFavorited: [Listener]
  numOfListenersWhoFavorited: Int
}

type Mutation {

    addArtist(
  stage_name: String!,
  genre: String!,
  label: String!,
  management_email: String!,
  management_phone: String!,
  home_city: String!,
  date_signed: String!
): Artist
# Validate email, phone ###-###-####, and date_signed MM/DD/YYYY.

editArtist(
  _id: String!,
  stage_name: String,
  genre: String,
  label: String,
  management_email: String,
  management_phone: String,
  home_city: String,
  date_signed: String
): Artist
# PATCH-style: AT LEAST ONE FIELD OTHER THAN ID MUST BE PRESENT.
# Validate email/phone/date formats if provided.

removeArtist(_id: String!): Artist
# Deletes an artist from MongoDB.
# Must also set the artist field of all their albums to null.

addListener(
  first_name: String!,
  last_name: String!,
  email: String!,
  date_of_birth: String!,
  subscription_tier: String!
): Listener
# Validate email, DOB format, age range (13–120), tier is FREE/PREMIUM.

editListener(
  _id: String!,
  first_name: String,
  last_name: String,
  email: String,
  date_of_birth: String,
  subscription_tier: String
): Listener
# PATCH-style: AT LEAST ONE FIELD OTHER THAN ID MUST BE PRESENT.
# Validate updated fields.

removeListener(_id: String!): Listener
# Deletes a listener from MongoDB.

addAlbum(
  title: String!,
  genre: String!,
  track_count: Int!,
  artist: String!,
  release_date: String!,
  promo_start: String!,
  promo_end: String!
): Album
# Validate artist id exists, track_count 1–200, all dates valid,
# promo_start >= release_date, promo_end > promo_start.

editAlbum(
  _id: String!,
  title: String,
  genre: String,
  track_count: Int,
  artist: String,
  release_date: String,
  promo_start: String,
  promo_end: String
): Album
# PATCH-style: AT LEAST ONE FIELD OTHER THAN ID MUST BE PRESENT.
# If artist updated, validate artist exists.
# If dates updated, validate formats and ordering rules.

removeAlbum(_id: String!): Album
# Deletes an album from MongoDB.
# Must also remove this album’s ID from all listeners’ favorite_albums arrays.

updateAlbumArtist(albumId: String!, artistId: String!): Album
# Updates the artist assigned to a given album.
# Must validate both IDs exist and are valid.

favoriteAlbum(listenerId: String!, albumId: String!): Listener
# Adds albumId to the listener’s favorite_albums array if not already present.
# Validate both IDs exist.

unfavoriteAlbum(listenerId: String!, albumId: String!): Listener
# Removes albumId from the listener’s favorite_albums array.
# Validate both IDs exist.

}



`;