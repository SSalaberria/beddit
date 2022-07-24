import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../server/db/client';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === 'GET') {
        return handleGET(req, res);
    }

    if (req.method === 'POST') {
        return handlePOST(req, res);
    }

    return res.status(404).json({
        data: {
            message: 'Not found',
        },
    });
}

// GET /api/subeddit
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const subeddits = await prisma.subeddit.findMany({});

    return res.status(200).json({
        subeddits,
    });
};

// POST /api/subeddit
interface PostRequest {
    name: string;
    description: string;
}
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
    const { name, description }: PostRequest = req.body;

    const subeddit = await prisma.subeddit.create({
        data: {
            name: String(name),
            description: String(description),
        },
    });

    return res.status(200).json({
        subeddit,
    });
};
