const {ApolloServer} = require('apollo-server')

const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')
const mongoose = require('mongoose')

const {findOrCreateUser} = require('./controllers/userController')

require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, {  
    useUnifiedTopology: true
}).then(() => console.log('DB connected!'))
.catch(err => console.error(err))

const server = new ApolloServer( {
    typeDefs,
    resolvers,
    context:  async ({req}) => {
        let authToken = null
        let currentUser = null
        try {
            authToken = req.headers.authorization
            console.log(authToken)
            if (authToken) {
                
                // find or create user
                currentUser = await findOrCreateUser(authToken)
            }

        } catch(err) {
            console.error(`Unable to authenticate user with token ${authToken}`)
        }
        return {currentUser}
    }
});

server.listen().then(({url}) => {
    console.log(`listening to ${url}`)
});