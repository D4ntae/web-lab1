const pgp = require("pg-promise")()
const db = pgp("postgresql://web_lab1_user:edl2DXVU9jiwaWVefgp2L11gLjJoQHuF@dpg-csf9g8pu0jms73fejae0-a.frankfurt-postgres.render.com/web_lab1")

module.exports = db
