import express, {Request, Response} from 'express'
import path from 'path';

const app = express()
const port = 5001


app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded


// Set the directory where the views are located
app.set('views', path.join(__dirname, '/../views'));
app.use('/static', express.static('public'))

// Set EJS as the view engine but use it to render .html files
app.engine('html', require('ejs').renderFile);
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

app.post("/login", (req: Request, res: Response) => {
    const userId = req.body.username
    const user = DATABASE.getUser(userId)

    if (user && req.body.password === user.password) {
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

app.post("/register", (req: Request, res: Response) => {
    const userId = req.body.username
    const credentials: UserCredentials = { name: req.body.username, password: req.body.password}
    DATABASE.setUser(userId, credentials)
    res.redirect("/login")
})

// ---- HOME ----
app.get("/home", (req, res: Response) => {
    res.render("home")
    }
)


app.listen(port, () => console.log(`Running on port ${port}`))


