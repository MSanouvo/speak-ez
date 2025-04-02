const { Client } = require("pg")
require("dotenv").config()

const SQL = `
CREATE TABLE IF NOT EXISTS Users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  first_name VARCHAR ( 255 ),
  last_name VARCHAR ( 255 ),
  username VARCHAR ( 255 ),
  password VARCHAR ( 255 ),
  isMember boolean NOT NULL DEFAULT false,
  isAdmin boolean NOT NULL DEFAULT false,
  date_created DATE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Messages (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  message VARCHAR ( 255 ),
  author VARCHAR ( 255 ),
  date_created DATE NOT NULL DEFAULT NOW()
);
`

async function main() {
    console.log("seeding...")
    const client = new Client({
        connectionString: process.env.CONNECTION_STRING
    })
    await client.connect()
    await client.query(SQL)
    await client.end()
    console.log('done')
}

main()