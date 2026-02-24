import { ApolloServer} from '@apollo/server';
import { standAloneServer } from '@apollo/server/standalone';

import { typeDefs } from './typeDefs.js';
import { resolvers } from './resolvers.js';



const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const { url } = await standAloneServer(server, {
    listen: { port: 4000 },
});

console.log(`Server ready at ${url}`);
