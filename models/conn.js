require('dotenv').config();
const debug = require('debug')('[repowatch:database]');
const knex = require('knex');


const options = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
};

const pgp = require('pg-promise')({
    query: (e) => debug(e.query)
});

const db = pgp(options);


// const options = {
//     client: 'pg',
//     connection: {
//         host: process.env.DB_HOST,
//         port: process.env.DB_PORT,
//         database: process.env.DB_NAME
//     },
//     log: {
//         log: debug,
//         error: debug,
//         warn: debug,
//         debug, debug
//     }
// };

// const db = knex(options)

debug('connection successful');

module.exports = db;