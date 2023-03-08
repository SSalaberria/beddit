import { prisma } from '../src/server/db/client';
import seedData from './seed-data.json';
import { Prisma } from '@prisma/client';

// To seed: npx prisma db seed
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
                data: {
                    ...subeddit,
                    posts: {
                        // @ts-expect-error
                        create: subeddit.posts.map(post => ({
                            title: post.title,
                            content: post.content,
                            contentType: 'Text',
                            comments: {
                                createMany: {
                                    data: post.comments.map(comment => ({
                                        content: comment.content,
                                        parentId: null,
                                        authorId:
                                            users[
                                                Math.floor(
                                                    Math.random() *
                                                        users.length,
                                                )
                                            ]?.id,
                                    })),
                                },
                            },
                            authorId:
                                users[Math.floor(Math.random() * users.length)]
                                    ?.id,
                        })),
                    },
                },
            });
        } catch (e) {
            console.log(e);
        }
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
