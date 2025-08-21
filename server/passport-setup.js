const passport = require('passport');
const GoogleStrategy = require('passpoer-google-auth20').Strategy;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
        },
        async(accessToken, refreshToken, profile, done) => {
            try {
                let user = await prisma.user.findUnique({
                    where: { email: profile.emails[0].value },
                });
                if(user) {
                    return done(null, user);
                } else {
                    const newUser = await prisma.user.create({
                        data: {
                            email: profile.email[0].value,
                            name: profile.displayName,
                        },
                    });
                    return done(null, newUser);
                }
            } catch (error) {
                return done(error, null);
            }
        }
    )
);