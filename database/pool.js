require("dotenv").config()

const { Pool } = require("pg")

module.exports = new Pool({
    //Add connection string to .env to keep hidden
    connectionString: process.env.CONNECTION_STRING
})