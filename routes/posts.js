require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');


const posts = [
    {
        userId: "6490041963a6937a1c0fb689",
        title: "Post 1"
    },
    {
        userId: "6490041963a6937a1c0fb689",
        title: "Post 2"
    },
]

//get post by user id


router.get('/', authenticateToken, (req, res) => {
    const userPosts = posts.filter(post => post.userId === req.user.id)
    res.json(userPosts)
});



function authenticateToken(req, res, next) {
    //accessToken is not sent in the header
    //get token from cookie

    const token = req.cookies['accessToken']


    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden" })
        }


        req.user = user

        next()
    })
}



module.exports = router;