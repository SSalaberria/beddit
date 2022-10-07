import type { NextApiRequest, NextApiResponse } from 'next';
import {
    Session,
    unstable_getServerSession as getServerSession,
} from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from 'src/server/db/client';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const session = await getServerSession(req, res, authOptions);

    if (req.method === 'PUT') {
        return handlePUT(req, res, session);
    }

    return res.status(404).json({
        data: {
            message: 'Not found',
        },
    });
}

const handlePUT = async (
    req: NextApiRequest,
    res: NextApiResponse,
    session: Session | null,
) => {
    const { name: subedditName } = req.query;
    const { username } = req.body;

    if (!subedditName || !username) {
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

    const [subeddit, user, requestingUser] = await Promise.all([
        prisma.subeddit.findUnique({
            where: {
                name: subedditName as string,
            },
            include: {
                moderators: true,
            },
        }),
        prisma.user.findUnique({
            where: {
                name: username,
            },
            select: {
                id: true,
                name: true,
                image: true,
            },
        }),
        prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
        }),
    ]);

    if (subeddit?.ownerId !== requestingUser?.id) {
        return res.status(403).json({
            data: {
                message: 'Forbidden',
            },
        });
    }

    if (!subeddit || !user) {
        return res.status(404).json({
            data: {
                message: 'Not found',
            },
        });
    }

    if (subeddit.moderators.some(mod => mod.id === user.id)) {
        return res.status(400).json({
            data: {
                message: 'Bad request',
            },
        });
    }

    await prisma.subeddit.update({
        where: {
            id: subeddit.id,
        },
        data: {
            moderators: {
                connect: {
                    id: user?.id,
                },
            },
        },
    });

    return res.status(200).json(user);
};
