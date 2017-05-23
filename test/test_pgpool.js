/* global require console process it describe after before __dirname */

const pg_pool = require('../lib/pg_pool.js')

const fs     = require('fs')

const tap = require('tap')

const path    = require('path')
const rootdir = path.normalize(__dirname)

const config_file = rootdir+'/../test.config.json'
const config_okay = require('config_okay')

tap.plan(6)

config_okay(config_file)
    .then( config => {
        //console.log('got config')
        // config has config parameters for pg_pool
        tap.test('init function exists',function (t) {
            t.plan(1)
            t.pass('testing pool_init')
            t.end()
        })
        tap.test('expect a failure',async function(t) {
            t.plan(2)
            t.ok(pg_pool.pool_init,'have pool init')
            return pg_pool.pool_init()
                .then( r => {
                    // console.log('should not be in this branch')
                    t.fail ('should have crashed')
                    t.end()
                    return null
                } )
                .catch( e => {
                    // console.log('inside expected catch statement')
                    t.pass('failed to init without config file')
                    t.end()
                    return null
                })

        })

        tap.test('expect a failure to get pool',async function(t) {
            t.plan(2)
            t.ok(pg_pool.get_pool,'have get_pool fn')
            return pg_pool.get_pool({})
                .then( r => {
                    t.fail('should have crashed')
                    t.end()
                    return null
                })
                .catch (e => {
                    t.pass('failed to get pool without config')
                    t.end()
                    return null
                })
        })

        tap.test('expect a failure',async function(t) {
            t.plan(2)
            t.ok(pg_pool.pool_init,'have pool init')
            return pg_pool.pool_init({})
                .then( r => {
                    // console.log('should not be in this branch')
                    t.fail ('should have crashed')
                    t.end()
                    return null
                } )
                .catch( e => {
                    // console.log('inside expected catch statement')
                    t.pass('failed to init without config file')
                    t.end()
                    return null
                })

        })

        tap.test('expect pool to init okay',async function(t) {
            t.plan(2)
            t.ok(pg_pool.pool_init,'have pool init')
            return pg_pool.pool_init(config)
            //await init;
                .then( (pool)=>{
                    // console.log('then statement')
                    t.pass('initialize db pool okay')
                    t.end()
                    return null
                })
                .catch( (e) => {
                    // console.log('catch statement')
                    t.fail('failed to initialize db pool okay')
                    t.end()
                    return null
                })
        })
        tap.test('expect success getting pool',async function(t) {
            t.plan(1)
            return pg_pool.get_pool({})
                .then( r => {
                    t.pass('should not crashed')
                    t.end()
                    return null
                })
                .catch (e => {
                    t.fail('failed to get pool with valid init')
                    t.end()
                    return null
                })
        })

        tap.end()

        return null
    })
    .catch( (err) =>{
        console.log('external catch statement triggered')
        console.log(err)
        throw new Error(err)

    })
