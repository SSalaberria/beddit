import { VoteOption } from 'src/utils/ts/types';
import { NextApiRequest, NextApiResponse } from 'next';
import {
    Session,
    unstable_getServerSession as getServerSession,
} from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from 'src/server/db/client';

export default async function (req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({
            message: 'Unauthorized',
        });
    }

    if (req.method === 'POST') {
        handlePOST(req, res, session);
    }

    if (req.method === 'DELETE') {
        handleDELETE(req, res, session);
    }
}

// POST /api/post/[id]/vote
interface PostRequest {
    voteType: VoteOption;
}
const handlePOST = async (
    req: NextApiRequest,
    res: NextApiResponse,
    session: Session,
) => {
    const { id: postId } = req.query;
    const { voteType }: PostRequest = req.body;

    if (!voteType || !postId || (voteType !== 1 && voteType !== -1)) {
        return res.status(400).json({
            error: 'Invalid request: wrong inputs',
        });
    }

    if (!session?.user?.id) {
        return res.status(400).json({
            error: 'Invalid request: user not found',
        });
    }

    const vote = await prisma.vote.upsert({
        where: {
            authorId_postId: {
                authorId: session.user.id,
                postId: Number(postId),
            },
        },
        create: {
            authorId: String(session.user.id),
            postId: Number(postId),
            voteType: voteType || 1,
            voteableType: 'Post',
        },
        update: {
            voteType: voteType,
        },
    });
    /* Alternative way to upsert vote:
    const post = await prisma.post.update({
        where: {
            id: Number(postId),
        },
        data: {
            votes: {
                upsert: {
                    where: {
                        authorId_postId: {
                            authorId: session.user.id,
                            postId: Number(postId),
                        },
                    },
                    create: {
                        authorId: String(session.user.id),
                        voteType: voteType || 1,
                        voteableType: 'Post',
                    },
                    update: {
                        voteType: voteType,
                    },
                },
            },
        },
    });
    */

    return res.status(200).json(vote);
};

// DELETE /api/post/[id]/vote
const handleDELETE = async (
    req: NextApiRequest,
    res: NextApiResponse,
    session: Session,
) => {
    const { id: postId } = req.query;
    if (!postId) {
        return res.status(400).json({
            error: 'Invalid request: missing post id',
        });
    }

    if (!session?.user?.id) {
        return res.status(400).json({
            error: 'Invalid request: user not found',
        });
    }

    const vote = await prisma.vote.delete({
        where: {
            authorId_postId: {
                authorId: session.user.id,
                postId: Number(postId),
            },
        },
    });

    return res.status(200).json(vote);
};
