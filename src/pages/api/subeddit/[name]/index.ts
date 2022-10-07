import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../server/db/client';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === 'GET') {
        return handleGET(req, res);
    }

    return res.status(404).json({ message: 'Not found' });
}

// /api/subeddit/[name]
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const { name } = req.query;

    const subeddit = await prisma.subeddit.findUnique({
        where: {
            name: name as string,
        },
        include: {
            posts: {
                take: 10,
                orderBy: {
                    createdAt: 'desc',
                },
            },
            moderators: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
            owner: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
        },
    });

    if (!subeddit) {
        return res.status(404).json({ message: 'Not found' });
    }

    return res.status(200).json(subeddit);
};
