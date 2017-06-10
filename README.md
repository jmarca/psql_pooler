# psql_pooler

[![Greenkeeper badge](https://badges.greenkeeper.io/jmarca/psql_pooler.svg)](https://greenkeeper.io/)
[![Build Status](https://www.travis-ci.org/jmarca/psql_pooler.svg?branch=master)](https://www.travis-ci.org/jmarca/psql_pooler)
[![Code Climate](https://codeclimate.com/github/jmarca/psql_pooler/badges/gpa.svg)](https://codeclimate.com/github/jmarca/psql_pooler)
[![Test Coverage](https://codeclimate.com/github/jmarca/psql_pooler/badges/coverage.svg)](https://codeclimate.com/github/jmarca/psql_pooler/coverage)


Simple bit of code extracted from another repo to create a
long-running pool
using [node-postgres](https://github.com/brianc/node-postgres).  I
found I was including that other repo and using this code a lot so I
pulled it into its own repo


To test, create a file called test.config.json (and make sure it is
excluded from git).  If you want to get a clue what to put there, read
through the .travis.yml code.  But you can do this on linux

```
psql -c "CREATE USER testu WITH LOGIN CREATEDB PASSWORD 'my secret password';" -U postgres
export PGPASSWORD="my secret password"
psql -c 'create database atestdb;' -U testu -d postgres
echo "{\"postgresql\":{\"host\":\"127.0.0.1\",\"port\":5432,\"username\":\"testu\",\"db\":\"atestdb\"}}" > test.config.json && chmod 0600 test.config.json
```

That will create a temporary user "testu" and a temporary database.

The tests will just access this database under the given user name.
If you already have a db user and database that you want to use, you
can skip creating the fake user and fake database and just put them
directly in the `test.config.json` file as follows:

```
{
    "postgresql":
        {
            "host":"127.0.0.1",
            "port":5432,
            "username":"mydbuser",
            "db":"mydb"
        }
}
```

The password for the user account is taken from either the root
.pgpass file, or else from the environment variable `PGPASSWORD`.

Similarly, I *think* (but I haven't written the tests yet) you can put
the host, port, username, db into environment variables.  Probably a
bad idea however.  The whole point of this module is to be able to
open up multiple connection pools to different databases to use in
programs.
