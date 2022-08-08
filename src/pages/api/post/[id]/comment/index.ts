import { NextApiRequest, NextApiResponse } from 'next';
import {
    Session,
    unstable_getServerSession as getServerSession,
} from 'next-auth';
import { prisma } from '../../../../../server/db/client';
import { authOptions } from '../../../auth/[...nextauth]';

export default async function (req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (req.method === 'POST') {
        return handlePOST(req, res, session as Session);
    }

    return res.status(405).json({
        message: 'Method Not Allowed',
    });
}

// POST /api/post/[id]/comment
interface PostRequest {
    content: string;
    depth: number;
    parentId?: string;
}
const handlePOST = async (
    req: NextApiRequest,
    res: NextApiResponse,
    session: Session,
) => {
    const { content, parentId, depth }: PostRequest = req.body;
    const { id: postId } = req.query;

    if (!session) {
        return res.status(401).json({
            message: 'Unauthorized',
        });
    }

    if (!content || !postId || (!depth && depth !== 0)) {
        return res.status(400).json({
            message: 'Missing content',
        });
    }

    const post = await prisma.post.findUnique({
        where: {
            id: Number(postId),
        },
    });

    if (!post) {
        return res.status(401).json({
            message: 'Unauthorized',
        });
    }

    if (depth > post.commentsDepth + 1) {
        return res.status(400).json({
            message: 'Depth too deep',
        });
    }

    const [comment, newPost] = await Promise.all([
        prisma.comment.create({
            data: {
                content,
                parentId: parentId,
                authorId: String(session.user.id),
                postId: Number(postId),
            },
        }),
        ...(depth > post.commentsDepth
            ? [
                  prisma.post.update({
                      where: {
                          id: Number(postId),
                      },
                      data: {
                          commentsDepth: depth,
                      },
                  }),
              ]
            : []),
    ]);

    return res.status(200).json({
        comment,
    });
};
