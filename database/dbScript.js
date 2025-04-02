const { Client } = require("pg")
require("dotenv").config()

const SQL = `
SQL STRING GOES HERE
`

async function main() {
    console.log("seeding...")
    const client = new Client({
        //Add connection string to .env
        connectionString: process.env.CONNECTION_STRING
    })
    await client.connect()
    await client.query(SQL)
    await client.end()
    console.log('done')
}

main()