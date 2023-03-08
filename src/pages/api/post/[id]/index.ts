import { NextApiRequest, NextApiResponse } from 'next';
import {
    Session,
    unstable_getServerSession as getServerSession,
} from 'next-auth';
import { Comment } from 'src/utils/ts/interfaces';
import { prisma } from '../../../../server/db/client';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const session = await getServerSession(req, res, authOptions);

    if (req.method === 'GET') {
        return handleGET(req, res, session);
    }

    if (req.method === 'DELETE') {
        return handleDELETE(req, res, session);
    }

    res.status(405).json({ error: 'Method not allowed' });
}

// GET /api/posts/{ID}
interface GetRequest {
    id?: number;
}
const handleGET = async (
    req: NextApiRequest,
    res: NextApiResponse,
    session: Session | null,
) => {
    const { id }: GetRequest = req.query;

    if (!id) {
        res.status(400).json({ error: 'Missing post id' });
        return;
    }

    const [initialPostData, votesSum] = await Promise.all([
        prisma.post.findUnique({
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
        }),
        prisma.vote
            .findMany({ where: { postId: Number(id) } })
            .then(votes => votes.reduce((acc, vote) => acc + vote.voteType, 0)),
    ]);

    if (!initialPostData) {
        res.status(404).json({ error: 'Post not found' });
        return;
    }
    const additionalIncludeParams = {
        author: true,
        votes: { where: { voteableType: 'Comment' } },
        // ...(session && { votes: { where: { authorId: session.user.id } } }),
    };

    const nestedCommentsQuery: { include?: {} } = {};

    for (let i = 0; i <= initialPostData?.commentsDepth; i++) {
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
            subeddit: {
                include: {
                    moderators: true,
                },
            },
            comments: {
                where: {
                    parentId: null,
                },
                ...nestedCommentsQuery,
                orderBy: {
                    createdAt: 'desc',
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

    if (!post) {
        res.status(404).json({ error: 'Post not found' });
    }

    const processedPost = {
        ...post,
        _count: {
            ...post?._count,
            votesSum,
        },
        comments: processComments(post?.comments as any, session?.user?.id),
    };

    res.status(200).json(processedPost);
};

interface DeleteRequest {
    id?: number;
}

// DELETE /api/posts/{id}
async function handleDELETE(
    req: NextApiRequest,
    res: NextApiResponse,
    session: Session | null,
) {
    const { id: postId }: DeleteRequest = req.query;

    if (!postId) {
        res.status(400).json({ error: 'Missing post id' });
        return;
    }

    if (!session) {
        return res.status(401).json({
            data: {
                message: 'Unauthorized',
            },
        });
    }

    const [post, user] = await Promise.all([
        prisma.post.findUnique({
            where: {
                id: Number(postId),
            },
            include: {
                subeddit: true,
            },
        }),
        prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
            include: {
                moderatedSubeddits: true,
            },
        }),
    ]);

    if (
        post?.authorId !== user?.id &&
        !user?.moderatedSubeddits.find(sub => sub.id === post?.subedditId) &&
        !user?.isSuperAdmin
    ) {
        return res.status(403).json({
            data: {
                message: 'Forbidden',
            },
        });
    }

    const deletedPost = await prisma.post.delete({
        where: {
            id: Number(postId),
        },
    });

    return res.status(200).json({
        data: {
            message: 'Post deleted succesfully.',
            deletedPost,
        },
    });
}

// Problem: I need to count votes for each comment and check if the user has voted on it, as I couldn't find a way to work it out in the prisma query without making too many DB requests.
// Solution: Go through each comment and count the total vote count: +1 for each upvote, -1 for each downvote. Also find a vote with the same user making the request.
// Caveat: The implementation SUCKS and isn't scalable, as I used recursion which is a stack overflow bomb waiting to happen.
const processComments = (comments: Comment[], userId?: string): any[] => {
    return comments.map(comment => {
        return {
            ...comment,
            children: processComments(comment.children, userId),
            content: comment.deletedAt ? null : comment.content,
            voteCount: comment.votes?.reduce(
                (acc, vote) => acc + vote.voteType,
                0,
            ),
            userVote: comment.votes?.find(vote => vote?.authorId === userId),
        };
    });
};
