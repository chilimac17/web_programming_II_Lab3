export const typeDefs = `#graphql

 type Query {
    artists: [Artist]                      # Returns an array of all artists.
listeners: [Listener]                  # Returns an array of all listeners.
albums: [Album]                        # Returns an array of all albums.

getArtistById(_id: String!): Artist
getListenerById(_id: String!): Listener
getAlbumById(_id: String!): Album

getAlbumsByArtistId(artistId: String!): [Album]
getListenersByAlbumId(albumId: String!): [Listener]   # All listeners who favorited the album

getAlbumsByGenre(genre: String!): [Album]             # Case-insensitive
getArtistsByLabel(label: String!): [Artist]           # Case-insensitive
getListenersBySubscription(tier: String!): [Listener] # "FREE" or "PREMIUM" (case-insensitive OK, normalize)

getArtistsSignedBetween(start: String!, end: String!): [Artist]
# date_signed falls between start and end (inclusive). Must validate both dates.

getAlbumsByPromoDateRange(start: String!, end: String!): [Album]
# Albums whose promo_start and promo_end fall within the supplied range (inclusive). Must validate both dates.

searchListenersByLastName(searchTerm: String!): [Listener]
# Returns listeners whose last name contains the searchTerm (case-insensitive).
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

    removeArtist(_id: String!): Artist

    addListener(
      first_name: String!,
      last_name: String!,
      email: String!,
      date_of_birth: String!,
      subscription_tier: String!
    ): Listener

    editListener(
      _id: String!,
      first_name: String,
      last_name: String,
      email: String,
      date_of_birth: String,
      subscription_tier: String
    ): Listener

    removeListener(_id: String!): Listener

    addAlbum(
      title: String!,
      genre: String!,
      track_count: Int!,
      artist: String!,
      release_date: String!,
      promo_start: String!,
      promo_end: String!
    ): Album

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

    removeAlbum(_id: String!): Album

    updateAlbumArtist(albumId: String!, artistId: String!): Album

    favoriteAlbum(listenerId: String!, albumId: String!): Listener
    unfavoriteAlbum(listenerId: String!, albumId: String!): Listener
  }
`;