const pg = require('pg');

//this initializes a connection pool
//it will keep idle connections open for 1 seconds
//and set a limit of maximum 10 idle clients

let pool

function pool_init(options){
    // console.log('pool init with options')
    return new Promise( (resolve,reject) => {
        //console.log('inside the pool init Promise with config =',options)
        if (pool !== undefined ){
            return resolve(pool)
        }

        //console.log('configuring pool init Promise')
        // initialize the postgresql pool
        const host = options.postgresql.host ? options.postgresql.host : '127.0.0.1';
        const user = options.postgresql.username ? options.postgresql.username : 'myname';
        const pass = options.postgresql.password
        const port = options.postgresql.port ? options.postgresql.port :  5432;
        const db  = options.postgresql.loopshare_db ? options.postgresql.loopshare_db : 'loopshare'

        const connectionParams = {
            'user': user,
            'host': host,
            'database': db,
            'max': 10, // max number of clients in pool
            'idleTimeoutMillis': 1000 // close & remove clients which have been idle > 1 second
        }
        if(pass !== undefined){
            connectionParams.password = pass
        }


            //console.log('newing the pg pool')
        pool = new pg.Pool(connectionParams);

        pool.on('error', function(e, client) {
            // if a client is idle in the pool
            // and receives an error - for example when your PostgreSQL server restarts
            // the pool will catch the error & let you handle it here
            //
            // not sure when this might arise, so for now, just die
            console.error('pgpool handling error')
            throw new Error(e)
        });

        // console.log('resolve the pool')

        return resolve(pool)
    })
}

const get_pool = async function(config) {
    return pool_init(config)
        .then( () => {
            return pool
        })
}
// // this is the right way to export the query method
// let query = (text, values, cb) => {
//     console.log('query:', text, values)
//     return pool.query(text, values, cb)
// }

// let query = (config) =>{

// }

// (async () => {let connect = (config) => {
//     if(config  && pool === undefined){
//         pool_init(config)
//     }

//     let client = await pool.connect()
//     try {
//         var result = await client.query('select $1::text as name', ['brianc'])
//     console.log('hello from', result.rows[0])
//   } finally {
//     client.release()
//   }
// })().catch(e => console.error(e.message, e.stack))

exports.pool_init= pool_init
exports.get_pool = get_pool
