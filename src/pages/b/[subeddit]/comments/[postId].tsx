import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import Voting from 'src/components/common/Voting';
import { usePostMutations, usePostVoteMutation } from 'src/hooks/usePosts';
import { CONTENT_TYPES } from 'src/utils/consts';
import { VoteOption } from 'src/utils/ts/types';
import Comment from '../../../../components/comments/Comment';
import CommentForm from '../../../../components/comments/CommentForm';
import Layout from '../../../../components/layout/Layout';
import { formatDate } from '../../../../utils/date';
import {
    createComment,
    deleteComment,
    deleteCommentVote,
    deletePost,
    fetchPost,
    voteComment,
} from '../../../../utils/requests';
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
    const { data: session } = useSession();
    const router = useRouter();
    const { voteMutation, deleteVoteMutation } = usePostVoteMutation({
        subeddit: post.subeddit.name,
    });
    const { deletePostMutation } = usePostMutations({
        subeddit: post.subeddit.name,
    });
    const [vote, setVote] = useState<VoteOption | null>(
        // @ts-ignore
        post?.votes?.length > 0 ? post?.votes[0]?.voteType : null,
    );
    const [votes, setVotes] = useState<number>(post._count.votesSum);

    const showModActions = useMemo(
        () =>
            Boolean(
                post?.subeddit.moderators &&
                    post.subeddit.moderators.find(
                        mod => mod.id === session?.user.id,
                    ),
            ),
        [session],
    );

    const handleCommentVote = useCallback(
        (payload: { commentId: string; voteType: VoteOption }) =>
            voteComment({ ...payload, postId: post.id }).then(() =>
                window.location.reload(),
            ),
        [],
    );

    const handleCommentDelete = useCallback(
        (commentId: string) =>
            deleteComment({ commentId, postId: post.id }).then(() =>
                window.location.reload(),
            ),
        [],
    );

    const handleDeletePost = useCallback(
        () =>
            deletePostMutation
                .mutateAsync({ postId: post.id })
                .then(() => router.push(`/b/${post.subeddit.name}`)),
        [],
    );

    const handlePostVote = useCallback(
        (voteSelected: VoteOption) => {
            setVote(voteSelected);
            setVotes(votes + (vote ? 2 : 1) * voteSelected);
            voteMutation.mutate({ postId: post.id, voteType: voteSelected });
        },
        [vote, votes],
    );

    const handleDeletePostVote = useCallback(() => {
        if (vote) {
            setVote(null);
            setVotes(votes - vote);
            deleteVoteMutation.mutate({ postId: post.id });
        }
    }, [vote, votes]);

    const handleDeleteCommentVote = useCallback((commentId: string) => {
        deleteCommentVote({ commentId, postId: post.id }).then(() =>
            window.location.reload(),
        );
    }, []);

    const handleCommentSubmit = useCallback(
        (formData: { content: string; depth: number; parentId?: string }) =>
            createComment({ ...formData, postId: post.id }).then(() =>
                window.location.reload(),
            ),
        [post],
    );

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
                    <div
                        className={`flex justify-center items-center ${
                            post.contentType === CONTENT_TYPES.TEXT
                                ? 'w-24'
                                : 'w-64 h-64'
                        }`}
                    >
                        {(post.contentType === CONTENT_TYPES.TEXT ||
                            post.contentType === CONTENT_TYPES.IMAGE) && (
                            <Image
                                src={
                                    post.contentType === CONTENT_TYPES.IMAGE
                                        ? post.content
                                        : '/images/bd-logo.svg'
                                }
                                width={256}
                                height={256}
                                {...(post.contentType ===
                                    CONTENT_TYPES.IMAGE && {
                                    objectFit: 'scale-down',
                                })}
                            />
                        )}

                        {post.contentType === CONTENT_TYPES.VIDEO && (
                            <iframe
                                width={240}
                                height={190}
                                src={post.content.replace(
                                    '/watch?v=',
                                    '/embed/',
                                )}
                                allowFullScreen
                                frameBorder="0"
                            ></iframe>
                        )}
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
                            {post._count.comments} comment
                            {post._count.comments !== 1 && 's'}
                        </p>
                    </div>
                    <div className="flex ml-auto">
                        <Voting
                            total={votes}
                            vote={vote}
                            onVote={handlePostVote}
                            onVoteDelete={handleDeletePostVote}
                        />
                    </div>
                </div>
                {post.contentType === CONTENT_TYPES.TEXT && (
                    <div className="border rounded-md p-2 bg-slate-100 dark:bg-slate-800">
                        <p className="">{post.content}</p>
                    </div>
                )}
                {(post.authorId === session?.user.id ||
                    post.subeddit.moderators?.find(
                        mod => mod.id === session?.user.id,
                    )) && (
                    <div>
                        <button
                            className="btn-secondary"
                            onClick={handleDeletePost}
                        >
                            Delete post
                        </button>
                    </div>
                )}

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
                            onDeleteVote={handleDeleteCommentVote}
                            onDelete={handleCommentDelete}
                            showModActions={showModActions}
                            loggedUserId={session?.user.id}
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
