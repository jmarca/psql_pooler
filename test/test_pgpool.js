/* global require console process it describe after before __dirname */

const pg_pool = require('../lib/pg_pool.js')

const fs     = require('fs')

const tap = require('tap')

const path    = require('path')
const rootdir = path.normalize(__dirname)

const config_file = rootdir+'/../test.config.json'
const config_okay = require('config_okay')

tap.plan(5)

config_okay(config_file)
    .then(async ( config ) => {
        //console.log('got config')
        // config has config parameters for pg_pool

        await tap.test('expect a failure to get pool',async function(t) {
            //t.plan(2)
            t.ok(pg_pool.get_pool,'have get_pool fn')
            const empty_pool = await  pg_pool.get_pool({})
            // empty config results in broken pool
            //console.log('mpty pool is ',empty_pool)
            let client
            try {
                client = await empty_pool.connect()
                t.fail ('should have crashed')
                if(client) client.release()
            }
            catch(e){
                // console.log('pool.connect failed as expected',e)
                t.match(e,/does not exist/,'cannot log in with bad values')
                t.pass('empty (default) connection parameters')
            }
            finally{
                t.end()
            }

        })

        await tap.test('expect a failure to get pool',async function(t) {
            //t.plan(2)
            t.ok(pg_pool.get_pool,'have get_pool fn')
            try {
                const empty_pool = await  pg_pool.get_pool()
                t.fail ('should have crashed')
                // empty config results in broken pool
                //console.log('mpty pool is ',empty_pool)
            }
            catch(e){
                // console.log('pool.connect failed as expected',e)
                t.match(e,/empty config file/,'cannot log in without config')
                t.pass('empty (default) connection parameters')
            }
            finally{
                t.end()
            }

        })


        await tap.test('expect a failure',async function(t) {
            //t.plan(2)
            return pg_pool.get_pool({'postgresql':{'username':'slub',
                                                   'password':'grobblefruit'}})
                .then( async (broken_pool) => {
                    let client
                    try {
                        client = await broken_pool.connect()
                        console.log('pool.connect did not fail as expected',client)
                        t.fail ('should have crashed')
                        client.release()
                    }
                    catch(e){
                        console.log('pool.connect failed as expected')
                        t.match(e,/does not exist/,'user name fail')
                        t.pass('bad connection parameters')
                    }
                    return null
                })
                .catch( e => {
                    console.log('inside expected catch statement',e)

                    t.pass('failed to init without config file')
                    t.end()

                    return null
                })

        })

        await tap.test('expect success getting pool 1',async function(t) {
            //t.plan(1)
            try {
                const pool = await pg_pool.get_pool(config)
                const client = await pool.connect()
                t.pass('get pool okay')
                await client.release()
                t.end()
                return null
            }
            catch (e) {
                // console.log('catch statement')
                t.fail('failed to initialize db pool okay')
                t.end()
                return null
            }
        })

        await tap.test('expect success getting pool 2',async function(t) {
            //t.plan(1)
            try {
                const pool = await pg_pool.get_pool(config)
                const client = await pool.connect()
                t.pass('should not crashed')
                await client.release()
                t.end()
                return null
            } catch (e){
                t.fail('failed to get pool with valid init')
                t.end()
                return null
            }
        })

        tap.end()

        return null
    })
    .catch( (err) =>{
        console.log('external catch statement triggered')
        console.log(err)
        throw new Error(err)

    })
