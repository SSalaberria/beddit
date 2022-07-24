import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import AddPostModal from '../components/AddPostModal';
import { useAddPostMutation, usePosts } from '../hooks/usePosts';
import { formatDate } from '../utils/date';
import { SubmitPostData } from '../utils/ts/interfaces';

type Props = {
    subeddit?: string;
};

const PostsFeed = ({ subeddit }: Props) => {
    const { data, fetchNextPage, isFetching, hasNextPage } = usePosts({
        subeddit,
    });
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

    return (
        <>
            {data?.pages
                .flatMap(pageData => pageData.posts)
                .map(post => (
                    <div
                        className="relative hover:scale-105 cursor-pointer duration-500 flex flex-col justify-center items-center text-center rounded shadow-xl border-2 border-gray-500 h-full w-full p-6 pt-10"
                        key={post.id}
                    >
                        <span className="text text-right absolute top-2 right-6 text-gray-600 dark:text-gray-500 font-bold">
                            /{post.subeddit.name}
                        </span>
                        <h2 className="text-lg ">{post.title}</h2>

                        <p className="text-sm ">{post.content}</p>

                        <Link href={`/b/${subeddit}/comments/${post.id}`}>
                            <a
                                className="text-sm  underline decoration-dotted underline-offset-2 cursor-pointer mt-3"
                                rel="noreferrer"
                            >
                                See comments
                            </a>
                        </Link>

                        <p className="text-sm text-right  ml-auto">
                            Made by {post.author.name}
                            <br />
                            {formatDate(post.createdAt, {
                                dateStyle: 'long',
                                timeStyle: 'short',
                            })}
                        </p>
                    </div>
                ))}
            {/* @ts-ignore */}
            <div ref={obsElement} />
        </>
    );
};

export default PostsFeed;
