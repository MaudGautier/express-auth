import express, {Request, Response} from 'express'
import path from 'path';

const app = express()
const port = 5001


app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


// Set the directory where the views are located
app.set('views', path.join(__dirname, '/../views'));
app.use('/static', express.static('public'))

// Set EJS as the view engine but use it to render .html files
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

type UserPassword = { password: string }
type User = Record<number, UserPassword>

// In-memory DB
const DATABASE = {
    users: {} as User[],
    getUser(id: number) {
        return DATABASE.users[id]
    },
    setUser(id: number, password: UserPassword) {
        DATABASE.users[id] = password
        return password
    }
}


// ---- LOGIN -----
app.get("/login", (_: Request, res: Response) => {
    res.render("login")
})

app.post("/login", (req: Request, res: Response) => {
    console.log("body", req.body)

})

app.get('/', (_: Request, res: Response) => {
    res.redirect("/login")
})
app.listen(port, () => console.log(`Running on port ${port}`))


