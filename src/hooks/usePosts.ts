import { ContentType, VoteOption } from 'src/utils/ts/types';
import type { InfiniteData } from 'react-query';
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from 'react-query';
import httpClient from '../utils/http';
import { Post } from '../utils/ts/interfaces';
import { deletePost } from 'src/utils/requests';

interface PostsParams {
    page?: number;
    perPage?: number;
    subeddit?: string;
    query?: string | null;
}

interface PostsResponse {
    posts: Post[];
    nextPage: number;
    currentPage: number;
}

const fetchPosts = async (
    params: PostsParams = {
        page: 1,
        perPage: 5,
    },
): Promise<PostsResponse> => {
    return httpClient.get('/post', { params }).then(res => res.data);
};

export const usePostMutations = (params?: PostsParams) => {
    const queryClient = useQueryClient();

    const addPostMutation = useMutation(
        ({
            subeddit,
            ...data
        }: {
            title: string;
            content: string;
            subeddit: string;
            contentType: ContentType;
        }) =>
            httpClient
                .post('/post', { ...data, subedditName: subeddit })
                .then(res => res.data),
        {
            onSuccess: (newPost: Post) => {
                queryClient.setQueryData<InfiniteData<PostsResponse>>(
                    ['posts', params || {}],
                    // @ts-ignore
                    prevData => {
                        const pageToModify = prevData?.pages[0];

                        const modifiedPages = prevData?.pages.map(page => ({
                            ...page,
                            posts:
                                page.currentPage === pageToModify?.currentPage
                                    ? [newPost, ...page.posts]
                                    : page.posts,
                        }));

                        return {
                            ...prevData,
                            pages: modifiedPages,
                        };
                    },
                );
            },
        },
    );

    const deletePostMutation = useMutation(
        (payload: { postId: number }) => deletePost(payload),
        {
            onSuccess: (_data, { postId }) => {
                queryClient.setQueryData<InfiniteData<PostsResponse>>(
                    ['posts', params],
                    // @ts-ignore
                    prevData => {
                        const modifiedPages = prevData?.pages.map(page => ({
                            ...page,
                            posts: page.posts.filter(
                                post => post.id !== postId,
                            ),
                        }));

                        return { ...prevData, pages: modifiedPages };
                    },
                );
            },
        },
    );

    return { addPostMutation, deletePostMutation };
};

export const usePostVoteMutation = (params?: PostsParams) => {
    const queryClient = useQueryClient();
    const queryKey = ['posts', params || {}];

    const voteMutation = useMutation(
        ({ postId, voteType }: { postId: number; voteType: VoteOption }) =>
            httpClient
                .post(`/post/${postId}/vote`, { voteType })
                .then(res => res.data),
        {
            onMutate: variables => {
                const { postId, voteType } = variables;
                queryClient.setQueryData<InfiniteData<PostsResponse>>(
                    queryKey,
                    // @ts-ignore
                    prevData => {
                        const modifiedPages = prevData?.pages?.map(page => {
                            const modifiedPosts = page.posts.map(post => {
                                if (post.id === postId) {
                                    const isPostVoted = Boolean(
                                        post.votes?.length,
                                    );
                                    let voteDifferenceMagnitude = isPostVoted
                                        ? 2
                                        : 1;

                                    return {
                                        ...post,
                                        votes: [
                                            {
                                                voteType,
                                            },
                                        ],
                                        _count: {
                                            ...post._count,
                                            votesSum:
                                                post._count.votesSum +
                                                (voteType === 1
                                                    ? voteDifferenceMagnitude
                                                    : -voteDifferenceMagnitude),
                                        },
                                    };
                                }
                                return post;
                            });
                            return {
                                ...page,
                                posts: modifiedPosts,
                            };
                        });

                        return {
                            ...prevData,
                            pages: modifiedPages,
                        };
                    },
                );
            },
        },
    );

    const deleteVoteMutation = useMutation(
        ({ postId }: { postId: number }) =>
            httpClient.delete(`/post/${postId}/vote`),
        {
            onMutate: variables => {
                const { postId } = variables;
                queryClient.setQueryData<InfiniteData<PostsResponse>>(
                    queryKey,
                    // @ts-ignore
                    prevData => {
                        const modifiedPages = prevData?.pages?.map(page => {
                            const modifiedPosts = page.posts.map(post => {
                                if (post.id === postId && post.votes?.length) {
                                    return {
                                        ...post,
                                        votes: [],
                                        _count: {
                                            ...post._count,
                                            votesSum:
                                                post._count.votesSum +
                                                (post?.votes[0]?.voteType === 1
                                                    ? -1
                                                    : 1),
                                        },
                                    };
                                }
                                return post;
                            });
                            return {
                                ...page,
                                posts: modifiedPosts,
                            };
                        });

                        return {
                            ...prevData,
                            pages: modifiedPages,
                        };
                    },
                );
            },
        },
    );

    return { voteMutation, deleteVoteMutation };
};

export const usePosts = (params: PostsParams) => {
    const postsQuery = useInfiniteQuery(
        ['posts', params],
        ({ pageParam }) => fetchPosts({ ...params, page: pageParam || 1 }),
        {
            staleTime: 1000 * 60 * 5,
            getNextPageParam: (lastPage, allPages) => {
                if (lastPage.posts.length === 0) return;

                return lastPage.nextPage;
            },
        },
    );

    return postsQuery;
};
