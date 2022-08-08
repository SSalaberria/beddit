import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback } from 'react';
import { VoteOption } from 'src/utils/ts/types';
import Comment from '../../../../components/Comment';
import CommentForm from '../../../../components/CommentForm';
import Layout from '../../../../components/layout/Layout';
import { formatDate } from '../../../../utils/date';
import httpClient from '../../../../utils/http';
import { fetchPost } from '../../../../utils/requests';
import { Post } from '../../../../utils/ts/interfaces';

export const getServerSideProps: GetServerSideProps = async context => {
    const { postId, subeddit } = context.query;

    const post = await fetchPost(
        { id: Number(postId) },
        { Cookie: context.req.headers.cookie },
    ).catch(err => {
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
    console.log(post);
    const { data: session } = useSession();

    const handleCommentSave = (formData: {
        content: string;
        depth: number;
        parentId?: string;
    }): void => {
        httpClient
            .post(`/post/${post.id}/comment`, formData)
            .then(() => window.location.reload());
    };

    const handleCommentVote = useCallback(
        ({
            commentId,
            voteType,
        }: {
            commentId: string;
            voteType: VoteOption;
        }) => {
            httpClient
                .post(`/post/${post.id}/comment/${commentId}/vote`, {
                    voteType,
                })
                .then(() => window.location.reload());
        },
        [],
    );

    const handleCommentSubmit = useCallback(handleCommentSave, [post]);

    return (
        <Layout>
            <Head>
                <title>{`${post.title} - Beddit`}</title>
                <meta name="description" content={post.title} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.title} />
            </Head>
            <div className="flex flex-col gap-4 ">
                <div className="flex justify-center -mt-4">
                    <Link href={`/b/${post.subeddit.name}`}>
                        <a>
                            <h3 className="text-[2rem] lg:text-[1rem] md:text-[1.5rem] font-bold clickable">
                                /{post.subeddit.name}
                            </h3>
                        </a>
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex justify-center items-center w-64">
                        <Image
                            src="/images/bd-logo.svg"
                            width={64}
                            height={64}
                        />
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className=" text-[1.5rem] md:text-[1.8rem]">
                            {post.title}
                        </h2>
                        <div>
                            <p className="">
                                {post.author.name} -{' '}
                                {formatDate(post.createdAt, {
                                    dateStyle: 'long',
                                    timeStyle: 'short',
                                })}
                            </p>
                        </div>
                        <p
                            className="inline text-secondary hover:cursor-pointer hover:underline"
                            onClick={() =>
                                document
                                    ?.getElementById('comments-section')
                                    ?.scrollIntoView()
                            }
                        >
                            {post._count.comments} comments
                        </p>
                    </div>
                </div>
                <div className="border rounded-md p-2 bg-slate-100 dark:bg-slate-800">
                    <p className="">{post.content}</p>
                </div>
                <div className="flex flex-col">
                    <p className="text-[1.5rem]">Comments</p>
                </div>
                <div>
                    {session && (
                        <CommentForm
                            onSaveComment={formData =>
                                handleCommentSubmit({ ...formData, depth: 0 })
                            }
                        />
                    )}
                </div>
                <div id="comments-section">
                    {post.comments.map(comment => (
                        <Comment
                            comment={comment}
                            onSaveComment={handleCommentSubmit}
                            onVote={handleCommentVote}
                            depth={0}
                            key={comment.id}
                        />
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default PostDetails;
