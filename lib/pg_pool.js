const pg = require('pg');

//this initializes a connection pool
//it will keep idle connections open for 1 seconds
//and set a limit of maximum 10 idle clients

const pool = new Map()

function pool_init(options){
    // console.log('pool init with options')
    return new Promise( (resolve,reject) => {
        //console.log('inside the pool init Promise with config =',options)
        //console.log('configuring pool init Promise')
        // initialize the postgresql pool
        const psql_opts = options.postgresql || {}
        const host = psql_opts.host ? psql_opts.host : '127.0.0.1';
        const user = psql_opts.username ? psql_opts.username : 'myname';
        const pass = psql_opts.password
        const port = psql_opts.port ? psql_opts.port :  5432;
        const db  = psql_opts.db
        if(db === undefined) return reject('need options.db to be defined')

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
        console.log(connectionParams)
        let pool_key = JSON.stringify(connectionParams)
        if (pool.has(pool_key) ){
            return resolve(pool.get(pool_key))
        }


        //console.log('newing the pg pool')
        let onepool = new pg.Pool(connectionParams);
        pool.set(pool_key,onepool)

        onepool.on('error', function(e, client) {
            // if a client is idle in the pool
            // and receives an error - for example when your PostgreSQL server restarts
            // the pool will catch the error & let you handle it here
            //
            // not sure when this might arise, so for now, just die
            console.error('pgpool handling error')
            throw new Error(e)
        });

        // console.log('resolve the pool')

        return resolve(pool.get(pool_key))
    })
}

const get_pool = async function(config) {
    if(! config  || config === undefined ){
        throw new Error('empty config file not allowed')
    }
    return pool_init(config)
        .then( (the_pool) => {
            return the_pool
        })
}

//exports.pool_init= pool_init
exports.get_pool = get_pool
