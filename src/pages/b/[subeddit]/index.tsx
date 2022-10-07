import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useState, useCallback } from 'react';
import { ContentType } from 'src/utils/ts/types';
import AddPostModal from '../../../components/posts/AddPostModal';
import Layout from '../../../components/layout/Layout';
import PostsFeed from '../../../components/posts/PostsFeed';
import { useAddPostMutation } from '../../../hooks/usePosts';
import { fetchSubedditData, fetchSubeddits } from '../../../utils/requests';
import { useAddModeratorMutation, useSubeddit } from 'src/hooks/useSubeddit';
import { dehydrate, QueryClient } from 'react-query';
import { useSession } from 'next-auth/react';
import AddModeratorInput from 'src/components/subeddits/AddModeratorInput';

type PageParams = {
    subeddit?: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
    const subedditsData = await fetchSubeddits().catch(err => ({
        subeddits: [],
    }));

    const paths = subedditsData.subeddits.map(subeddit => ({
        params: { subeddit: subeddit.name },
    }));

    return {
        paths,
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps = async context => {
    const queryClient = new QueryClient();
    const { subeddit: name } = context.params as PageParams;

    if (!name) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    await queryClient.prefetchQuery(['subeddit', name], () =>
        fetchSubedditData({ name }),
    );

    return {
        props: {
            name,
            dehydratedState: dehydrate(queryClient),
        },
    };
};

type Props = {
    name: string;
};

const SubedditPage = ({ name }: Props) => {
    const { data: subeddit } = useSubeddit({ name });
    const { data: loggedUserData } = useSession();
    const addPostMutation = useAddPostMutation({
        subeddit: name,
    });
    const addModeratorMutation = useAddModeratorMutation({ name });
    const [showAddPostModal, setShowAddPostModal] = useState(false);

    const handleSubmitPost = useCallback(
        async (data: {
            title: string;
            content: string;
            contentType: ContentType;
        }) => {
            if (subeddit) {
                addPostMutation.mutate({
                    ...data,
                    subeddit: subeddit.name,
                });
            }

            setShowAddPostModal(false);
        },
        [],
    );

    const handleAddModerator = useCallback(
        (username: string) => {
            if (
                subeddit &&
                !Boolean(subeddit.moderators?.find(m => m.name === username))
            ) {
                addModeratorMutation.mutate({
                    subedditName: subeddit.name,
                    username,
                });
            }
        },
        [subeddit?.moderators, addModeratorMutation.isSuccess],
    );

    return (
        <Layout>
            <Head>
                <title>/{subeddit?.name} - Beddit</title>
            </Head>
            <div className="flex flex-col justify-center items-center gap-4">
                <h2 className="flex text-[1.5rem] lg:text-[4rem] md:text-[5rem] font-extrabold flex-wrap justify-center">
                    <span className="hidden sm:block">
                        Bed<span className="text-purple-300">dit</span>
                    </span>

                    <span className="text-gray-600">/{subeddit?.name}</span>
                </h2>

                <h3 className="font-semibold">{subeddit?.description}</h3>

                <div className="flex flex-col items-end text-sm text-right self-end">
                    {Boolean(subeddit?.owner) && (
                        <p>Created by {subeddit?.owner?.name}.</p>
                    )}
                    {subeddit?.moderators && subeddit.moderators.length > 0 && (
                        <p>
                            Moderated by:{' '}
                            {subeddit.moderators
                                ?.map(mod => mod.name)
                                .join(', ')}
                            .
                        </p>
                    )}
                    {Boolean(loggedUserData?.user) &&
                        loggedUserData?.user.id === subeddit?.owner?.id && (
                            <div className="max-w-[3rem] focus-within:max-w-[16rem] hover:max-w-[16rem] transition-all duration-200 pt-2">
                                <AddModeratorInput
                                    onAddModerator={handleAddModerator}
                                />
                            </div>
                        )}
                </div>

                <button
                    className="btn-primary"
                    onClick={() => setShowAddPostModal(true)}
                    data-bs-toggle="modal"
                    data-bs-target="#addPostModal"
                >
                    Create Post
                </button>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-3 pt-3 w-full lg:w-2/3 md:w-full mx-auto">
                <PostsFeed subeddit={subeddit?.name} />
            </div>
            {showAddPostModal && (
                <AddPostModal
                    onSubmitPost={handleSubmitPost}
                    onClose={() => setShowAddPostModal(false)}
                />
            )}
        </Layout>
    );
};

export default SubedditPage;
