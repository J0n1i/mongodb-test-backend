require('dotenv').config()
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user');
const Token = require('../models/token');


//get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

const expireTime = 5

//register
router.post('/register', async (req, res) => {

    //check if user exists
    if (await User.findOne({ username: req.body.username })) {
        return res.status(400).json({ message: "User already exists" })
    }

    const user = new User({
        username: req.body.username,
        password: await bcrypt.hash(req.body.password, 10)
    })

    try {
        const newUser = await user.save()
        res.status(201).json({ message: "User created", newUser })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

});

//login
router.post("/login", async (req, res) => {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
        return res.status(400).json({ message: "User does not exist" })
    }


    try {
        if (await bcrypt.compare(req.body.password, user.password)) {

            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            res.cookie("accessToken", accessToken, { httpOnly: true, maxAge: 1000 * expireTime })
            res.cookie("refreshToken", refreshToken, { httpOnly: true })

            res.status(200).json({ message: "Login successful" })

        } else {
            res.status(400).json({ message: "Login failed" })
        }

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});


router.delete("/logout", (req, res) => {
    try {
        //delete refresh token from database from tokens collection
        const refreshToken = req.body.token
        Token.findOneAndDelete({ token: refreshToken })

        //delete cookies from browser
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")

        res.status(204).json({ message: "Successfully logged out" })


    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.post("/refresh", (req, res) => {
    const refreshToken = req.cookies['refreshToken']

    if (refreshToken == null) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    if (!Token.findOne({ token: refreshToken })) {
        return res.status(403).json({ message: "Forbidden" })
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({ message: "Forbidden" })
        }

        const accessToken = generateAccessToken( user.id )

        res.cookie("accessToken", accessToken, { httpOnly: true })
        res.json({ message: "Token verified" })
    })
})


function generateAccessToken(id) {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expireTime });
}

function generateRefreshToken(id) {
    const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET);
    const token = new Token({
        _userId: id,
        token: refreshToken
    })

    token.save();

    return refreshToken
}


module.exports = router;