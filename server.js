const Hapi = require('hapi');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/drop_token');
//mongoose.connect('mongodb://username:password@host:port/database?options...');

const games = require('./routes/games');

const server = Hapi.server({
    port: 3002,
    host: 'localhost'
});


const gameRoutes = games.getRoutes();

gameRoutes.forEach( r => {
    server.route(r);
});


const init = async () => {
    //
    // await server.register({
    //     plugin: require('hapi-mongodb'),
    //     options: dbOpts
    // });


    await server.start();

    console.log(`Server running at: ${server.info.uri}`);
};



process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();

