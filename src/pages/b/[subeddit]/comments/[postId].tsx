import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '../../../../components/layout/Layout';
import { formatDate } from '../../../../utils/date';
import { fetchPost } from '../../../../utils/requests';
import { Post } from '../../../../utils/ts/interfaces';

export const getServerSideProps: GetServerSideProps = async context => {
    const { postId, subeddit } = context.query;
    const post = await fetchPost({ id: Number(postId) }).catch(err => {
        console.error(err);
    });

    if (!post) {
        return {
            redirect: {
                destination: `/b/${subeddit}`,
                permanent: false,
            },
        };
    }

    return {
        props: {
            post,
        },
    };
};

const PostDetails = ({ post }: { post: Post }) => {
    return (
        <Layout>
            <Head>
                <title>{`${post.title} - Beddit`}</title>
                <meta name="description" content={post.title} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.title} />
            </Head>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex justify-center items-center w-64">
                        <Image
                            src="/images/bd-logo.svg"
                            width={64}
                            height={64}
                        />
                    </div>
                    <div>
                        <h2 className="text text-[1.5rem] md:text-[2rem]">
                            {post.title}
                        </h2>
                        <div>
                            <p className="text">
                                {post.author.name} -{' '}
                                {formatDate(post.createdAt, {
                                    dateStyle: 'long',
                                    timeStyle: 'short',
                                })}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="border rounded-md p-2 bg-slate-100 dark:bg-slate-800">
                    <p className="text">{post.content}</p>
                </div>
                <div className="flex flex-col">
                    <p className="text-[1.5rem]">Comments</p>
                </div>
            </div>
        </Layout>
    );
};

export default PostDetails;
