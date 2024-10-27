var router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');
const db = require("./db")
const {
    v4: uuidv4
} = require('uuid')
const QRCode = require('qrcode');
const { auth } = require('express-oauth2-jwt-bearer');

const URL = "https://web-lab1-w9i3.onrender.com"

router.get('/', async (req, res, next) => {
    let numOfTickets = (await db.any("SELECT * FROM tickets")).length;
  res.render('index', {
    title: 'TicketHero',
    isAuthenticated: req.oidc.isAuthenticated(),
    numOfTickets
  });
});

router.get('/profile', requiresAuth(), (req, res, next) => {
  res.render('profile', {
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'Profile page'
  });
});

const jwtCheck = auth({
  audience: `${URL}/generate`,
  issuerBaseURL: 'https://dev-3lxt6450sbc3gc2m.eu.auth0.com/',
  tokenSigningAlg: 'RS256'
});


router.post("/generate", jwtCheck, async (req, res, next) => {
    const {vatin, firstName, lastName} = req.body;
    if (vatin === undefined || firstName === undefined || lastName === undefined) {
        return res.status(400).json({error: "The request is missing needed information"});
    }

    let userNum = undefined;
    try {
        userNum = (await db.any("SELECT * FROM users WHERE vatin = $1", vatin)).length;
    } catch (error) {
        console.error("DB error getting users", error);
        return res.status(500).json({error: "DB error getting users"});
    }

    try {
        if (userNum === 0) {
            await db.none("INSERT INTO users (id, vatin, name, surname) VALUES (gen_random_uuid(), $1, $2, $3)", [vatin, firstName, lastName]);
        }
    } catch (error) {
        console.error("Error creating new user", error);
        return res.status(500).json({error: "Error creating user"});
    }

    let user_id = undefined;
    try {
        user_id = (await db.one("SELECT id FROM users WHERE vatin = $1", vatin)).id;
    } catch (error) {
        console.error("DB error getting user", error);
        return res.status(500).json({error: "DB error getting user"});
    }

    let ticketNum = undefined;
    try {
        ticketNum = (await db.any("SELECT * FROM tickets JOIN users ON owner = users.id WHERE users.id = $1", user_id)).length;
    } catch (error) {
        console.error("DB error getting tickets", error);
        return res.status(500).json({error: "DB error getting tickets"});
    }

    if (ticketNum >= 3) {
        return res.status(400).json({error: "Cannot create more than 3 tickets per vatin"});
    }

    try {
        let ticket_uuid = uuidv4();
        await db.none("INSERT INTO tickets (id, time_generated, owner) VALUES ($1, now(), $2)", [ticket_uuid, user_id]);

        const qr = await QRCode.toDataURL(`${URL}/ticket?id=${ticket_uuid}`);

        console.log(ticket_uuid)

        return res.status(200).send(qr);
    } catch (error) {
        console.error("DB error inserting tickets", error);
    }
})

router.get("/ticket", requiresAuth(), async (req, res, next) => {
    if (req.query.id === undefined) {
        return res.status(404).render("error", {
            error: {
                status: 404
            },
            message: "Not found"
        });
    }

    let ticket_id = req.query.id;

    let user = await db.one("SELECT * FROM users JOIN tickets ON owner = users.id WHERE tickets.id = $1", ticket_id);
    if (user === undefined) {
        return res.status(400).json({error: "Cannot create more than 3 tickets per vatin"});
    }

    return res.status(200).render("ticket", {
        user: req.oidc.user.nickname,
        name: user.name,
        surname: user.surname,
        vatin: user.vatin
    });
})

module.exports = router;
