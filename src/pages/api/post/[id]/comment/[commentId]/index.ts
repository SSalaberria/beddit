import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession as getServerSession } from 'next-auth';
import { authOptions } from 'src/pages/api/auth/[...nextauth]';
import type { Session } from 'next-auth';
import { prisma } from 'src/server/db/client';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const session = await getServerSession(req, res, authOptions);

    if (req.method === 'DELETE') {
        return handleDELETE(req, res, session);
    }
}

// DELETE /api/post/{id}/comment/{commentId}
interface DeleteRequest {
    id?: string;
    commentId?: string;
}

async function handleDELETE(
    req: NextApiRequest,
    res: NextApiResponse,
    session: Session | null,
) {
    const { id: postId, commentId }: DeleteRequest = req.query;

    if (!postId || !commentId) {
        return res.status(400).json({
            data: {
                message: 'Bad request',
            },
        });
    }

    if (!session) {
        return res.status(401).json({
            data: {
                message: 'Unauthorized',
            },
        });
    }

    const [user, comment] = await Promise.all([
        prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
        }),
        prisma.comment.findUnique({
            where: {
                id: commentId,
            },
            include: {
                post: {
                    include: {
                        subeddit: {
                            include: {
                                moderators: true,
                            },
                        },
                    },
                },
            },
        }),
    ]);

    if (!user || !comment) {
        return res.status(400).json({
            data: {
                message: 'Bad request',
            },
        });
    }

    // delete comment
    if (
        user.id === comment.authorId ||
        user.isSuperAdmin ||
        comment.post.subeddit.moderators.find(mod => mod.id === user.id)
    ) {
        const updatedComment = await prisma.comment.update({
            where: {
                id: comment.id,
            },
            data: {
                deletedAt: new Date(),
            },
        });

        return res.status(200).json({
            data: {
                message: 'Comment deleted succesfully.',
                updatedComment,
            },
        });
    } else {
        return res.status(401).json({
            data: {
                message: 'Forbidden',
            },
        });
    }
}
