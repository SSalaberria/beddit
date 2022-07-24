import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../server/db/client';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === 'GET') {
        return handleGET(req, res);
    }

    res.status(405).json({ error: 'Method not allowed' });
}

// GET /api/posts/{ID}
interface GetRequest {
    id: number;
}
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;

    if (!id) {
        res.status(400).json({ error: 'Missing post id' });
        return;
    }

    const post = await prisma.post.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            author: true,
            subeddit: true,
        },
    });

    if (!post) {
        res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(post);
};
