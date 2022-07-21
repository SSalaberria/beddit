import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../server/db/client';
import { hashPassword } from '../../../utils/auth';

type LoginRequest = {
    email: string;
    password: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { email, password }: LoginRequest = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        res.status(400).json({
            error: 'The email is not registered.',
        });
    }

    // Removing password from response
    const { password: hashedPassword, ...userData } = user || {};

    if (hashPassword(password) !== hashedPassword) {
        res.status(400).json({
            error: 'Incorrect credentials.',
        });
    }

    res.status(200).json(userData);
}
