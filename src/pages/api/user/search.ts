import { prisma } from 'src/server/db/client';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === 'GET') {
        return handleGET(req, res);
    }

    return res.status(404).json({
        data: {
            message: 'Not found',
        },
    });
}

interface GetRequest {
    username?: string;
}
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const { username }: GetRequest = req.query;

    if (!username) {
        return res.status(400).json({
            data: {
                message: 'Bad request',
            },
        });
    }

    const users = await prisma.user.findMany({
        where: {
            name: {
                // @ts-ignore
                search: `*${username}*`,
            },
        },
        select: {
            name: true,
            image: true,
        },
        take: 5,
    });

    return res.status(200).json(users);
};
