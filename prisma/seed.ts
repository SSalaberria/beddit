import { prisma } from '../src/server/db/client';
import seedData from './seed-data.json';

async function main() {
    await prisma.user.createMany({
        data: seedData.users,
        skipDuplicates: true,
    });

    const users = await prisma.user.findMany({
        select: {
            id: true,
        },
    });

    seedData.subeddits.forEach(async subeddit => {
        const subedditData = {
            ...subeddit,
            posts: {
                create: subeddit.posts.map(post => ({
                    ...post,
                    authorId:
                        users[Math.floor(Math.random() * users.length)]?.id,
                })),
            },
        };

        try {
            await prisma.subeddit.create({
                // @ts-ignore
                data: subedditData,
            });
        } catch (e) {}
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async e => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
