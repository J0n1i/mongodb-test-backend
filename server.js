require('dotenv').config()
const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');

app.use(express.json());

app.use(cookieParser())



//allow credentials
const corsOptions = {
    origin: "http://localhost:3001",
    credentials: true
}


app.use(cors(corsOptions));






mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err));







app.use("/users", usersRouter);
app.use("/posts", postsRouter)



app.use(express.static('build'))




app.listen(port, () => console.log("Example app listening on port 3000"))