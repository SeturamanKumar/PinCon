const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,  
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            if(!profile || !profile.emails || profile.emails.length === 0){
                return done(new Error("Failed to get user profile from Google."));
            }

            const userEmail = profile.emails[0].value;
            const userName = profile.displayName;

            let user = await prisma.user.findUnique({
                where: { email: userEmail },
            });

            if(user){
                if(!user.name){
                    user = await prisma.user.update({
                        where: { email: userEmail },
                        data: { name: userName },
                    });
                }
            } else {
                user = await prisma.user.create({
                    data: {
                        email: userEmail,
                        name: userName,
                    },
                });
            }
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: 'http://localhost:5173/',
        failureRedirect: 'http://localhost:5173/login',
    })
);

app.get('/auth/logout', (req, res, next) => {
    req.logout((err) => {
        if(err) { return next(err); }
        res.redirect('http://localhost:5173/');
    });
});

app.get('/api/auth/status', (req, res) => {
    if(req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else {
        res.status(200).json(null);
    }
});

app.get('/', (req, res) => {
    res.send('Hello from the PinCon server!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});