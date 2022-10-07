import type { NextApiRequest, NextApiResponse } from 'next';
import {
    Session,
    unstable_getServerSession as getServerSession,
} from 'next-auth';
import { prisma } from 'src/server/db/client';
import { authOptions } from 'src/pages/api/auth/[...nextauth]';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const session = await getServerSession(req, res, authOptions);

    if (req.method === 'GET') {
        return handleGET(req, res);
    }

    if (req.method === 'POST') {
        return handlePOST(req, res, session);
    }

    return res.status(404).json({
        data: {
            message: 'Not found',
        },
    });
}

// GET /api/subeddit
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const subeddits = await prisma.subeddit.findMany({});

    return res.status(200).json({
        subeddits,
    });
};

// POST /api/subeddit
interface PostRequest {
    name: string;
    description: string;
}
const handlePOST = async (
    req: NextApiRequest,
    res: NextApiResponse,
    session: Session | null,
) => {
    const { name, description }: PostRequest = req.body;

    if (!session) {
        return res.status(401).json({
            data: {
                message: 'Unauthorized',
            },
        });
    }

    // const user = await prisma.user.findUnique({
    //     where: {
    //         id: session.user.id,
    //     },
    // });

    // if (!Boolean(user?.isSuperAdmin)) {
    //     return res.status(403).json({
    //         data: {
    //             message: 'Forbidden',
    //         },
    //     });
    // }

    try {
        const subeddit = await prisma.subeddit.create({
            data: {
                name: String(name),
                description: String(description),
                owner: {
                    connect: {
                        id: session.user.id,
                    },
                },
                moderators: {
                    connect: {
                        id: session.user.id,
                    },
                },
            },
        });

        return res.status(200).json(subeddit);
    } catch (e) {
        return res.status(400).json({
            data: {
                message:
                    "Couldn't create subeddit because the name is already taken",
            },
        });
    }
};
