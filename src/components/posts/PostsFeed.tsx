import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useRef, memo, useMemo } from 'react';
import { CONTENT_TYPES } from 'src/utils/consts';
import { Post } from 'src/utils/ts/interfaces';
import { VoteOption } from 'src/utils/ts/types';
import { usePosts, usePostVoteMutation } from '../../hooks/usePosts';
import { formatDate } from '../../utils/date';
import Logo from '../common/Logo';
import Voting from '../common/Voting';

interface PostProps {
    post: Post;
    subeddit?: string;
    onVote: (payload: { postId: number; voteType: VoteOption }) => void;
    onDeleteVote: (payload: { postId: number }) => void;
}

const Post = memo(
    ({ post, subeddit, onVote, onDeleteVote }: PostProps) => {
        const handleVote = (vote: VoteOption) =>
            onVote({
                postId: post.id,
                voteType: vote,
            });

        const handleDeleteVote = () => onDeleteVote({ postId: post.id });

        return (
            <div
                className="relative hover:scale-105  duration-500 flex flex-col min-h-[16.5rem] justify-between rounded shadow-xl border-2 border-gray-500 h-full w-full p-6 pt-10"
                key={post.id}
            >
                <div className="flex items-center h-full flex-1">
                    {post.contentType === CONTENT_TYPES.VIDEO && (
                        <iframe
                            width={240}
                            height={190}
                            src={post.content.replace('/watch?v=', '/embed/')}
                            allowFullScreen
                            className="w-32 h-32 sm:w-60 sm:h-fit"
                            frameBorder="0"
                        ></iframe>
                    )}

                    {post.contentType === CONTENT_TYPES.IMAGE && (
                        <Image
                            width={240}
                            height={190}
                            src={post.content}
                            objectFit="scale-down"
                        />
                    )}

                    {post.contentType === CONTENT_TYPES.TEXT && (
                        <div className="w-20">
                            <Logo width={60} height={60} />
                        </div>
                    )}

                    <div className="flex flex-col pl-4 gap-2 max-w-sm">
                        <h2 className="text-lg line-clamp-4 font-bold">
                            {post.title}
                        </h2>

                        {post.contentType === CONTENT_TYPES.TEXT && (
                            <>
                                <p className="text-sm line-clamp-3 break-words">
                                    {post.content}
                                </p>
                            </>
                        )}

                        <Link
                            href={`/b/${post.subeddit.name}/comments/${post.id}`}
                        >
                            <a
                                className="text-sm underline decoration-dotted underline-offset-2 cursor-pointer"
                                rel="noreferrer"
                            >
                                {post._count.comments} comment
                                {post._count.comments !== 1 && 's'}
                            </a>
                        </Link>
                    </div>

                    <div className="ml-auto">
                        <Voting
                            total={post._count.votesSum}
                            vote={post?.votes && post?.votes[0]?.voteType}
                            onVote={handleVote}
                            onVoteDelete={handleDeleteVote}
                        />
                    </div>
                </div>

                <Link href={`/b/${post?.subeddit?.name}`}>
                    <a>
                        <span className="text-right absolute top-2 right-6 text-gray-600 dark:text-gray-500 font-bold hover:underline">
                            /{post.subeddit.name}
                        </span>
                    </a>
                </Link>

                <div className="flex flex-col absolute bottom-2 right-6 w-full">
                    <p className="text-sm text-right ml-auto self-end">
                        Made by{' '}
                        <Link href={`/u/${post.author.name}`}>
                            <a rel="noreferrer">{post.author.name}</a>
                        </Link>
                        <br />
                        {formatDate(post.createdAt, {
                            dateStyle: 'long',
                            timeStyle: 'short',
                        })}
                    </p>
                </div>
            </div>
        );
    },
    (prevProps, nextProps) =>
        prevProps.subeddit === nextProps.subeddit &&
        prevProps.post.votes === nextProps.post.votes,
);

type Props = {
    subeddit?: string;
    query?: string | null;
    username?: string;
};

const PostsFeed = ({ subeddit, query, username }: Props) => {
    const params = useMemo(
        () => ({ subeddit, query, username }),
        [subeddit, query, username],
    );
    const { data, fetchNextPage, isFetching, hasNextPage } = usePosts(params);
    const { voteMutation, deleteVoteMutation } = usePostVoteMutation(params);
    const { status } = useSession();
    const observer = useRef<IntersectionObserver>();

    const obsElement = useCallback(
        (node: HTMLElement) => {
            if (isFetching || !hasNextPage) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(entries => {
                if (entries[0]?.isIntersecting && !isFetching) {
                    fetchNextPage();
                }
            });
            if (node) observer.current.observe(node);
        },

        [isFetching, hasNextPage],
    );

    const handleVote = useCallback(
        (payload: { postId: number; voteType: VoteOption }) => {
            if (status === 'authenticated') {
                voteMutation.mutate(payload);
            } else {
                signIn();
            }
        },
        [status],
    );

    const handleDeleteVote = useCallback((payload: { postId: number }) => {
        deleteVoteMutation.mutate(payload);
    }, []);

    return (
        <>
            {data?.pages[0]?.posts.length === 0 && (
                <p className="text-center italic text-slate-400">
                    No posts were found.
                </p>
            )}
            {data?.pages
                .flatMap(pageData => pageData.posts)
                .map(post => (
                    <Post
                        post={post}
                        subeddit={subeddit}
                        key={post.id}
                        onVote={handleVote}
                        onDeleteVote={handleDeleteVote}
                    />
                ))}

            {isFetching && (
                <>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="animate-pulse relative hover:scale-105  duration-500 flex flex-col min-h-[16.5rem] justify-between items-center text-center rounded shadow-xl border-2 border-gray-500 h-full w-full bg-gray-200 dark:bg-slate-800"
                        ></div>
                    ))}
                </>
            )}
            {/* @ts-ignore */}
            <div ref={obsElement} />
        </>
    );
};

export default PostsFeed;
