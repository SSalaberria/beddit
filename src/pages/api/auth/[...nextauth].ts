import NextAuth, { Awaitable, type NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../../../server/db/client';
import httpClient from '../../../utils/http';
import { logger } from '../../../utils/logger';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'jwt',
    },
    providers: [
        // GithubProvider({
        //   clientId: process.env.GITHUB_ID,
        //   clientSecret: process.env.GITHUB_SECRET,
        // }),
        // ...add more providers here
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                name: {
                    label: 'Email',
                    type: 'email',
                    placeholder: 'Enter your email',
                },
                password: {
                    label: 'Password',
                    type: 'password',
                    placeholder: 'Enter your password',
                },
            },
            async authorize(credentials, _req) {
                try {
                    const response = await httpClient.post('/user/login', {
                        email: credentials?.name,
                        password: credentials?.password,
                    });

                    if (response.status === 200) {
                        const user = response.data;
                        return user;
                    }
                } catch (error) {
                    logger.error(error);
                }

                return null;
            },
        }),
    ],
    logger: {
        error: (code, metadata) => {
            logger.error(code, metadata);
        },
        warn: code => {
            logger.warn(code);
        },
        debug: (code, metadata) => {
            logger.debug(code, metadata);
        },
    },
    callbacks: {
        session: async ({ session, token }) => {
            if (session?.user) {
                // @ts-ignore
                session.user.id = token.uid;
            }
            return session;
        },
        jwt: async ({ user, token }) => {
            if (user) {
                token.uid = user.id;
            }
            return token;
        },
    },
    secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
};

export default NextAuth(authOptions);
