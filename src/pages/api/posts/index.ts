import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from 'next-auth';
import { unstable_getServerSession as getServerSession } from 'next-auth';
import { authOptions as nextAuthOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../server/db/client';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const session: Session = await getServerSession(req, res, nextAuthOptions);
    console.log(session);

    if (req.method === 'POST') {
        return handlePOST(req, res, session);
    }

    if (req.method === 'GET') {
        return handleGET(req, res);
    }

    res.status(405).json({ error: 'Method not allowed' });
}

// POST /api/post
interface PostRequest {
    title: string;
    content: string;
}
async function handlePOST(
    req: NextApiRequest,
    res: NextApiResponse,
    session: Session,
) {
    if (!session) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const { title, content }: PostRequest = req.body;
    if (!title || !content) {
        res.status(400).json({ error: 'Missing title or content' });
        return;
    }

    const user = await prisma.user.findUnique({
        where: {
            email: session?.user?.email || '',
        },
    });

    const post = await prisma.post.create({
        data: {
            title,
            content,
            authorId: user?.id,
        },
        select: {
            id: true,
            title: true,
            content: true,
            author: {
                select: {
                    id: true,
                    name: true,
                },
            },
            createdAt: true,
            updatedAt: true,
        },
    });
    res.status(200).json(post);
    return;
}

// GET /api/post
interface GetRequest {
    page?: number;
    perPage?: number;
}
async function handleGET(req: NextApiRequest, res: NextApiResponse) {
    const { page, perPage }: GetRequest = req.query;

    const posts = await prisma.post.findMany({
        select: {
            id: true,
            title: true,
            content: true,
            author: {
                select: {
                    id: true,
                    name: true,
                },
            },
            createdAt: true,
            updatedAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: Math.min(perPage || 10, 10),
        skip: ((page || 1) - 1) * (perPage || 10),
    });

    res.status(200).json({
        posts,
        currentPage: Number(page),
        nextPage: Number(page || 1) + 1,
    });
    return;
}
