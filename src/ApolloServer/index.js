const { ApolloServer, gql } = require('apollo-server');
const raygun = require('raygun');
require('dotenv').config();

const raygunClient = new raygun.Client().init({
  apiKey: process.env.RAYGUN_KEY,
  batch: false,
  reportUncaughtExceptions: true,
  debugMode: true,
});





// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.

  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
  }
`;


const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];


// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    books: () => books,
  },
};


const {
  ApolloServerPluginLandingPageLocalDefault
} = require('apollo-server-core');

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: 'bounded',
  formatError: (err) => {

    // throw new error //NO

  //   var errorx =     {
  //     name: err.name,
  //     message: err.message,
  //     stack: err.extensions.exception.stacktrace.join(', \n')
  // }
  var errorx =   new Error( err.message);
  errorx.stack = err.extensions.exception.stacktrace.join(', \n')
    
      
   
   
//var errorx =  {message: err.message, stackTrace: err.extensions.exception.stacktrace}
 console.log('errorx',errorx);

    raygunClient.send( errorx, {rawError: err});




    return err;
  },
  /**
   * What's up with this embed: true option?
   * These are our recommended settings for using AS;
   * they aren't the defaults in AS3 for backwards-compatibility reasons but
   * will be the defaults in AS4. For production environments, use
   * ApolloServerPluginLandingPageProductionDefault instead.
  **/
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
  //  console.log("ebv", process.env);
});