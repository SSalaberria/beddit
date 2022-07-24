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
    id?: number;
}
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const { id }: GetRequest = req.query;

    if (!id) {
        res.status(400).json({ error: 'Missing post id' });
        return;
    }

    const initialPostData = await prisma.post.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            comments: {
                select: {
                    _count: true,
                },
            },
        },
    });

    if (!initialPostData) {
        res.status(404).json({ error: 'Post not found' });
        return;
    }

    const nestedCommentsQuery: { include?: {} } = {};
    const additionalIncludeParams = {
        author: true,
        _count: true,
    };
    for (let i = 0; i < initialPostData?.commentsDepth; i++) {
        nestedCommentsQuery['include'] = {
            children: {
                include: {
                    ...(nestedCommentsQuery['include'] || {
                        children: { include: additionalIncludeParams },
                    }),
                    ...additionalIncludeParams,
                },
            },
            ...additionalIncludeParams,
        };
    }

    const post = await prisma.post.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            author: true,
            subeddit: true,
            comments: {
                where: {
                    parentId: null,
                },
                ...nestedCommentsQuery,
                orderBy: {
                    createdAt: 'desc',
                },
            },
            _count: {
                select: {
                    comments: true,
                },
            },
        },
    });

    if (!post) {
        res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(post);
};
