import express, {Request, Response} from 'express'
import path from 'path';
import argon2 from "argon2";
import { nanoid } from 'nanoid'
import { fileURLToPath } from 'url';
import { renderFile } from 'ejs';

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

type UserCredentials = { name: string; password: string }
type Users = Record<string, UserCredentials>

// In-memory DB
const DATABASE = {
    users: {
        // user1: {name: "user1", password: "password"}
    } as Users,
    getUser(id: string) {
        return DATABASE.users[id]
    },
    setUser(id: string, password: UserCredentials) {
        DATABASE.users[id] = password
        return password
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
    const credentials: UserCredentials = { name: req.body.username, password: await argon2.hash(req.body.password)}
    DATABASE.setUser(userId, credentials)
    res.redirect("/login")
})

// ---- HOME ----
app.get("/home", (_: Request, res: Response) => {
    res.render("home")
    }
)


app.listen(port, () => console.log(`Running on port ${port}`))


