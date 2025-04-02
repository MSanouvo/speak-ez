const pool = require("./pool")

async function getAllMessages() {
	const { rows } = await pool.query("SELECT * FROM Messages");
	return rows
}

async function addMessage(message, username) {
	await pool.query("INSERT INTO Messages (message, author) VALUES($1, $2)", [message, username])
}

async function addUser(first_name, last_name, username, password) {
	await pool.query("INSERT INTO Users (first_name, last_name, username, password) VALUES($1, $2, $3, $4)", [first_name, last_name, username, password]);
}

async function makeMember(id){
	await pool.query("UPDATE Users SET ismember = true WHERE id = $1", [id])
}

async function makeAdmin(id){
    await pool.query("UPDATE Users SET isadmin = true WHERE id = $1", [id])
}

async function deleteMessage(id){
	await pool.query("DELETE FROM Messages WHERE id = $1", [id])
}

async function getLatestUser(){
    const { rows } = await pool.query("SELECT * FROM users ORDER BY id DESC");
    return rows[0]
}

module.exports = {
    getAllMessages,
    addMessage,
    addUser,
    makeMember,
    makeAdmin,
    deleteMessage,
    getLatestUser
}