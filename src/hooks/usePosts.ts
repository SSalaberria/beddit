import type { InfiniteData } from 'react-query';
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from 'react-query';
import httpClient from '../utils/http';
import { Post } from '../utils/ts/interfaces';

interface PostsParams {
    page?: number;
    perPage?: number;
    subeddit?: string;
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
    return httpClient.get('/posts', { params }).then(res => res.data);
};

export const useAddPostMutation = (params?: PostsParams) => {
    const queryClient = useQueryClient();

    return useMutation(
        ({
            title,
            content,
            subeddit,
        }: {
            title: string;
            content: string;
            subeddit: string;
        }) =>
            httpClient
                .post('/posts', { title, content, subeddit })
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
};

export const usePosts = (params: PostsParams) => {
    const postsQuery = useInfiniteQuery(
        ['posts', params],
        ({ pageParam }) => fetchPosts({ ...params, page: pageParam || 1 }),
        {
            getNextPageParam: (lastPage, allPages) => {
                if (lastPage.posts.length === 0) return;

                return lastPage.nextPage;
            },
        },
    );

    return postsQuery;
};
