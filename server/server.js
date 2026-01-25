const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const redis = require('redis');
const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});
redisClient.on('error', (err) => console.error('Redis Client Error'));
(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis successfully')
    } catch (error) {
        console.error('Fatal: Could not connect to Redis on startup')
    }
})();

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const DatauriParser = require('datauri/parser');
const path = require('path');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5001;

app.set('trust proxy', 1);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single('image');
const parser = new DatauriParser();

app.use(cors({
    origin: ['http://localhost:5173', process.env.CLIENT_URL],
    credentials: true,
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}));
app.use(passport.initialize());
app.use(passport.session());

const isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }

    res.status(401).json({ message: "You must be logged in to perform this action." });
};

const isAdmin = (req, res, next) => {
    if(res.user && req.user.role === 'ADMIN'){
        return next();
    }
    res.status(403).json({ message: "Admin access required." });
};

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
            const profileImageUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

            let user = await prisma.user.findUnique({
                where: { email: userEmail },
            });

            const dataForDb = {
                name: userName,
            };

            if(profileImageUrl) {
                const uploadOptions = {
                    overwrite: true,
                };
                if(user && user.profileImagePublicId) {
                    uploadOptions.public_id = user.profileImagePublicId;
                } else {
                    uploadOptions.folder = 'pincon-profiles';
                }
                uploadResult = await cloudinary.uploader.upload(profileImageUrl, uploadOptions);

                dataForDb.profileImageUrl = uploadResult.secure_url;
                dataForDb.profileImagePublicId = uploadResult.public_id;
            } else if(user && user.profileImagePublicId) {
                dataForDb.profileImageUrl = user.profileImageUrl;
                dataForDb.profileImagePublicId = user.profileImagePublicId;
            }

            if(user){
                user = await prisma.user.update({
                    where: { email: userEmail },
                    data: dataForDb,
                });
            } else {
                user = await prisma.user.create({
                    data: {
                        email: userEmail,
                        ...dataForDb,
                    },
                });
            }
            return done(null, user);
        } catch (error) {
            console.error("Error in Google Strategy:", error);
            return done(error, null);
        }
    }
));

passport.serializeUser((user, done) => { done(null, user.id); });
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
        successRedirect: process.env.CLIENT_URL,
        failureRedirect: `${process.env.CLIENT_URL}/login`,
    })
);

app.get('/auth/logout', (req, res, next) => {
    req.logout((err) => {
        if(err) { return next(err); }
        res.redirect(process.env.CLIENT_URL);
    });
});

app.get('/api/auth/status', (req, res) => {
    if(req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else {
        res.status(200).json(null);
    }
});

app.get('/api/pins', async (req, res) => {
    const cacheKey = 'all_pins';

    try {
        let cachedData = null;

        try {
            if(redisClient.isOpen) {
                cachedData = await redisClient.get(cacheKey);
            }
        } catch (error) {
            console.warn("Redis skipped:", redisError.message);
        }

        if(cachedData){
            console.log('Serving from cache');
            return res.status(200).json(JSON.parse(cachedData));
        }

        const pins = await prisma.pin.findMany({
            include: {
                author: {
                    select: { name: true },
                },
            },
        });
        await redisClient.set(cacheKey, JSON.stringify(pins), {
            EX: 600
        });
        console.log('Serving from database');
        res.status(200).json(pins);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pins:", error: error.message });
    }
});

app.get('/api/my-pins', async (req, res) => {
    const userId = req.user.id;
    try {
        const userPins = await prisma.pin.findMany({
            where: {
                authorId: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                author: {
                    select: { name: true },
                },
            },
        });
        res.status(200).json(userPins);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user pins: ', error: error.message });
    }
});             

app.post('/api/pins', isAuthenticated, multerUploads, async (req, res) => {
    const { description } = req.body;

    if(!req.file) {
        return res.status(400).json({ message: 'Image file is required' });
    }

    try {
        const file = parser.format(path.extname(req.file.originalname).toString(), req.file.buffer).content;
        const result = await cloudinary.uploader.upload(file, {
            folder: 'pincon',
        });
        const newPin = await prisma.pin.create({
            data: {
                imageUrl: result.secure_url,
                description: description,
                authorId: req.user.id,
            },
        });
        console.log("Invalidating cache for 'all_pins'");
        await redisClient.del('all_pins');
        res.status(201).json(newPin);
    } catch (error) {
        res.status(500).json({ message: 'Error creating pin', error: error.message });
    }
});

app.delete('/api/pins/:pinId', isAuthenticated, async (req, res) => {
    const { pinId } = req.params;
    const currentUser = req.user;

    try {
        const pin  = await prisma.pin.findUnique({
            where: { id: pinId },
        });

        if(!pin) {
            return res.status(404).json({ message: 'Pin Not Found' });
        }

        if(pin.authorId !== currentUser.id && currentUser.role !== 'ADMIN'){
            return res.status(403).json({ message: 'You are not authorized to delete this pin' });
        }

        await prisma.pin.delete({
            where: { id: pinId },
        });

        res.status(200).json({ message: 'Pin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting pin', error: error.message });
    }
});

app.put('/api/pins/:pinId', isAuthenticated, async (req, res) => {
    const { pinId } = req.params;
    const { description } = req.body;
    const currentUser = req.user;

    try {
        const pin = await prisma.pin.findUnique({
            where: { id: pinId },
        });

        if(!pin){
            return res.status(404).json({ message: 'Pin Not Found'})
        }

        if(pin.authorId !== currentUser.id && currentUser.role !== 'ADMIN'){
            return res.status(403).json({ message: 'You are not authorized to edit this pin.'});
        }

        const updatedPin = await prisma.pin.update({
            where: { id: pinId },
            data: { description: description },
        });

        res.status(200).json(updatedPin);
    } catch (error) {
        res.status(500).json({ message: 'Error updating pin', error: error.message });
    }
});

app.put('/api/users/me', isAuthenticated, multerUploads, async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;
    if(!name){
        return res.status(400).json({ message: 'Name is required' });
    }

    try {
        const dataToUpdate = {
            name: name,
        };

        if(req.file){
            const file = parser.format(path.extname(req.file.originalname).toString(), req.file.buffer).content;
            const result = await cloudinary.uploader.upload(file, {
                folder: 'pincon-profiles',
            });
            dataToUpdate.profileImageUrl = result.secure_url;
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user profile', error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Hello from the PinCon server!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
    console.log('Hot reload is working');
});