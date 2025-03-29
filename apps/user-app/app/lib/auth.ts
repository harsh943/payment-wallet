import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
    providers: [
      CredentialsProvider({
          name: 'Credentials',
          credentials: {
            phone: { label: "Phone number", type: "text", placeholder: "1231231231", required: true },
            password: { label: "Password", type: "password", required: true }
          },
          // TODO: User credentials type from next-aut
          async authorize(credentials: any) {
            // Do zod validation, OTP validation here
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            const existingUser = await db.user.findFirst({
                where: {
                    number: credentials.phone
                }
            });

            if (existingUser) {
                const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password);
                if (passwordValidation) {
                    return {
                        id: existingUser.id.toString(),
                        name: existingUser.name,
                        email: existingUser.number
                    }
                }
                return null;
            }

            try {
                const user = await db.user.create({
                    data: {
                        number: credentials.phone,
                        password: hashedPassword
                    }
                });
            
                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.number
                }
            } catch(e) {
                console.error(e);
            }

            return null
          },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            authorization: {
                params: {
                  prompt: "consent",
                  access_type: "offline",
                  response_type: "code"
                }
              }
          })
    ],
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
    },
    callbacks: {
        // TODO: can u fix the type here? Using any is bad
        async signIn({ user, account }:any) {
            // Only handle Google sign-ins
            if (account.provider === "google" && user.email) {
                try {
                    // Check if user already exists with this email
                    let dbUser = await db.user.findUnique({
                        where: { email: user.email }
                    });
                    
                    if (!dbUser) {
                        // Create a new user with this email and balance
                        await db.$transaction(async (tx) => {
                            // Create user first
                            dbUser = await tx.user.create({
                                data: {
                                    email: user.email,
                                    name: user.name || "",
                                    number: `google_${Date.now()}`,
                                    password: ""
                                }
                            });

                            // Create balance
                            await tx.balance.create({
                                data: {
                                    userId: dbUser.id,
                                    amount: 0,
                                    locked: 0
                                }
                            });
                        });
                    } else {
                        // Check if balance exists
                        const balance = await db.balance.findUnique({
                            where: { userId: dbUser.id }
                        });

                        if (!balance) {
                            // Create balance if it doesn't exist
                            await db.balance.create({
                                data: {
                                    userId: dbUser.id,
                                    amount: 0,
                                    locked: 0
                                }
                            });
                        }
                    }
                    return true;
                } catch (error) {
                    console.error('Error in Google sign-in:', error);
                    return false;
                }
            }
            
            return true; // Allow sign in
        },
        async session({ token, session }:any) {
            // For Google users, find their internal user ID by email
            if (token.email) {
                const user = await db.user.findUnique({
                    where: { email: token.email }
                });
                
                if (user) {
                    // Use our internal user ID instead of Google's ID
                    session.user.id = user.id.toString();
                } else {
                    // Fallback to the original ID
                    session.user.id = token.sub;
                }
            } else {
                session.user.id = token.sub;
            }
            
            return session;
        },
        async redirect({ url, baseUrl }:any) {
            // Redirect to dashboard after sign in
            return `${baseUrl}/dashboard`;
        }
    },
    secret: process.env.JWT_SECRET || "secret",
}