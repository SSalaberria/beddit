import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from 'next-auth';
import { unstable_getServerSession as getServerSession } from 'next-auth';
import { authOptions as nextAuthOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../server/db/client';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const session: Session | null = await getServerSession(
        req,
        res,
        nextAuthOptions,
    );

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
    subedditName: string;
}
async function handlePOST(
    req: NextApiRequest,
    res: NextApiResponse,
    session: Session | null,
) {
    if (!session) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const { title, content, subedditName }: PostRequest = req.body;
    if (!title || !content) {
        res.status(400).json({ error: 'Missing title or content' });
        return;
    }

    const user = await prisma.user.findUnique({
        where: {
            email: session?.user?.email || '',
        },
    });

    const subeddit = await prisma.subeddit.findUnique({
        where: {
            name: subedditName,
        },
    });

    const post = await prisma.post.create({
        // @ts-ignore
        data: {
            title,
            content,
            authorId: user?.id,
            subedditId: subeddit?.id,
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
    return res.status(200).json(post);
}

// GET /api/post
interface GetRequest {
    page?: number;
    perPage?: number;
    subedditName?: string;
}
async function handleGET(req: NextApiRequest, res: NextApiResponse) {
    const { page, perPage, subedditName }: GetRequest = req.query;

    const posts = await prisma.post.findMany({
        select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            author: {
                select: {
                    id: true,
                    name: true,
                },
            },
            subeddit: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        where: {
            subeddit: {
                name: subedditName,
            },
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
