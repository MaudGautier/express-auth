import express from 'express'
import path from 'path';

const app = express()
const port = 5001


// Set the directory where the views are located
app.set('views', path.join(__dirname, '/../views'));
app.use('/static', express.static('public'))

// Set EJS as the view engine but use it to render .html files
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


// ---- LOGIN -----
app.get("/login", (req, res) => {
    res.render("login")
})

app.get('/', (_, res) => {
    res.redirect("/login")
})
app.listen(port, () => console.log(`Running on port ${port}`))


