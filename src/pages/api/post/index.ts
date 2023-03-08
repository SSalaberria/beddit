import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from 'next-auth';
import { unstable_getServerSession as getServerSession } from 'next-auth';
import { authOptions as nextAuthOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../server/db/client';
import type { ContentType, Post } from '@prisma/client';
import { CONTENT_TYPES } from 'src/utils/consts';
import { uploadImage } from 'src/utils/file';
import { Prisma } from '@prisma/client';

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
        return handleGET(req, res, session);
    }

    res.status(405).json({ error: 'Method not allowed' });
}

// POST /api/post
interface PostRequest {
    title: string;
    content: string;
    subedditName: string;
    contentType: ContentType;
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

    let { title, content, subedditName, contentType }: PostRequest = req.body;
    if (!title || !content) {
        res.status(400).json({ error: 'Missing title or content' });
        return;
    }

    const subeddit = await prisma.subeddit.findUnique({
        where: {
            name: subedditName,
        },
    });

    if (contentType === CONTENT_TYPES.IMAGE) {
        const response = await uploadImage(content);
        content = response?.secure_url ?? '/images/bd-logo.svg';
    }

    const post = await prisma.post.create({
        // @ts-ignore
        data: {
            title,
            content,
            contentType,
            authorId: session.user?.id,
            subedditId: subeddit?.id,
        },
        include: {
            author: true,
            subeddit: {
                select: {
                    id: true,
                    name: true,
                },
            },
            ...(session && {
                votes: {
                    where: {
                        authorId: session?.user?.id,
                    },
                },
            }),

            _count: {
                select: {
                    comments: true,
                    votes: true,
                },
            },
        },
    });
    return res.status(200).json(post);
}

// GET /api/post
interface GetRequest {
    page?: number;
    perPage?: number;
    subeddit?: string;
    query?: string;
}
async function handleGET(
    req: NextApiRequest,
    res: NextApiResponse,
    session: Session | null,
) {
    const { page, perPage, subeddit, query }: GetRequest = req.query;

    const whereQuery: Prisma.PostWhereInput = {
        subeddit: {
            name: subeddit,
        },
    };

    if (query) {
        whereQuery.OR = [
            {
                title: {
                    contains: query,
                },
            },
            { content: { contains: query } },
        ];
    }

    const posts = await prisma.post.findMany({
        where: whereQuery,
        include: {
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
            ...(session && {
                votes: {
                    where: {
                        authorId: session?.user?.id,
                    },
                },
            }),
            _count: {
                select: {
                    comments: true,
                    votes: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: Math.min(perPage || 10, 10),
        skip: ((page || 1) - 1) * (perPage || 10),
    });

    // Need to get vote sums(+upvotes-downvotes) for each post
    // This solution is REALLY bad due to massive db queries, but it will do for now
    const voteCountsQueries: Promise<Post>[] = [];
    posts.forEach(post => {
        voteCountsQueries.push(
            prisma.vote.findMany({ where: { postId: post.id } }).then(votes => {
                return {
                    ...post,
                    _count: {
                        ...post._count,
                        votesSum: votes.reduce(
                            (acc, vote) => acc + vote.voteType,
                            0,
                        ),
                    },
                };
            }),
        );
    });
    const postsWithVotesSum = await Promise.all(voteCountsQueries);

    res.status(200).json({
        posts: postsWithVotesSum,
        currentPage: Number(page),
        nextPage: Number(page || 1) + 1,
    });
    return;
}
