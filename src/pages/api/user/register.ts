import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../server/db/client';
import { hashPassword } from '../../../utils/auth';

type RegisterRequest = {
    email: string;
    password: string;
    name: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { email, password, name }: RegisterRequest = req.body;

    const user = await prisma.user.findFirst({
        where: { OR: [{ email }, { name }] },
    });

    if (user) {
        res.status(400).json({
            error: 'Email already registered or username already exists.',
        });
        return;
    }

    const newUser = await prisma.user.create({
        data: {
            ...req.body,
            email,
            password: hashPassword(password),
        },
        select: {
            id: true,
            email: true,
            name: true,
            image: true,
        },
    });

    res.status(200).json(newUser);
}
