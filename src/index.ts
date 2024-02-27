import express, {Request, Response} from 'express'
import path from 'path';
import argon2 from "argon2";
import {nanoid} from 'nanoid'
import {fileURLToPath} from 'url';
import {renderFile} from 'ejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = 5001


app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded


// Set the directory where the views are located
app.set('views', path.join(__dirname, '/../views'));
app.use('/static', express.static('public'))

// Set EJS as the view engine but use it to render .html files
app.engine('html', renderFile);
app.set('view engine', 'html');

type UserName = string
type SessionId = string
type UserCredentials = { name: UserName; password: string }
type Users = Record<UserName, UserCredentials>
type Session = { name: UserName; sessionId: SessionId }
type Sessions = Record<SessionId, Session>

// In-memory DB
const DATABASE = {
    users: {
        // user1: {name: "user1", password: "password"}
    } as Users,
    getUser(id: string) {
        return DATABASE.users[id]
    },
    setUser(id: string, credentials: UserCredentials) {
        DATABASE.users[id] = credentials
        return credentials
    },
    session: {} as Sessions,
    setSession(sessionId: SessionId, session: Session) {
        DATABASE.session[sessionId] = session;
        return session
    },
    getSession(sessionId: SessionId | undefined) {
        if (!sessionId) {
            return null
        }
        return DATABASE.session[sessionId]
    }
}


// ---- LOGIN -----
app.get("/login", (_: Request, res: Response) => {
    res.render("login")
})

app.post("/login", async (req: Request, res: Response) => {
    const userId = req.body.username
    const user = DATABASE.getUser(userId)
    const passwordIsCorrect = user && await argon2.verify(user.password, req.body.password)

    if (passwordIsCorrect) {
        const sessionId = nanoid()
        const session: Session = {name: userId, sessionId: sessionId}
        DATABASE.setSession(sessionId, session)
        res.cookie('session', sessionId)

        res.redirect("/home")
    } else {
        res.json({"error": "Wrong username/password. Could not log in"})
    }
})

app.get('/', (_: Request, res: Response) => {
    res.redirect("/login")
})

// ---- REGISTER ----
app.get("/register", (_: Request, res: Response) => {
    res.render("register")
})

app.post("/register", async (req: Request, res: Response) => {
    const userId = req.body.username
    const credentials: UserCredentials = {name: req.body.username, password: await argon2.hash(req.body.password)}
    DATABASE.setUser(userId, credentials)
    res.redirect("/login")
})

// Check if user is authenticated
function isAuthenticated(req: Request) {
    console.log(req.get("Cookie"))
    const cookies = req.get("Cookie")
    const sessionId = cookies?.split("session=")[1]
    console.log("sessionId is", sessionId)

    const session = DATABASE.getSession(sessionId)
    if (!session) {
        return false
    }

    const userName = session.name
    const user = DATABASE.getUser(userName)

    console.log("User", userName, "is authenticated !")

    return true
}

// ---- HOME ----
app.get("/home", (req: Request, res: Response) => {
    if (isAuthenticated(req)) {
        res.render("home")
    } else {
        console.log("Not authenticated !")
        res.redirect("/login")
    }
})


app.listen(port, () => console.log(`Running on port ${port}`))


