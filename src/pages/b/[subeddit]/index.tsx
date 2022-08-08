import { GetStaticPaths, GetStaticProps } from 'next';
import { useState } from 'react';
import AddPostModal from '../../../components/AddPostModal';
import Layout from '../../../components/layout/Layout';
import PostsFeed from '../../../components/PostsFeed';
import { useAddPostMutation } from '../../../hooks/usePosts';
import { fetchSubedditData, fetchSubeddits } from '../../../utils/requests';
import { Subeddit } from '../../../utils/ts/interfaces';

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
    const { subeddit: name } = context.params as PageParams;

    if (!name) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    const subeddit = await fetchSubedditData({ name }).catch(err => {
        console.log(err);
    });

    if (!subeddit) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    return {
        props: {
            subeddit,
        },
    };
};

type Props = {
    subeddit: Subeddit;
};

const SubedditPage = ({ subeddit }: Props) => {
    const addPostMutation = useAddPostMutation({
        subeddit: subeddit.name,
    });
    const [showAddPostModal, setShowAddPostModal] = useState(false);

    const handleSubmitPost = async (data: {
        title: string;
        content: string;
    }) => {
        if (subeddit) {
            addPostMutation.mutate({
                ...data,
                subeddit: subeddit.name,
            });
        }

        setShowAddPostModal(false);
    };

    return (
        <Layout>
            <div className="flex flex-col justify-center items-center gap-4">
                {showAddPostModal && (
                    <AddPostModal
                        onSubmitPost={handleSubmitPost}
                        onClose={() => setShowAddPostModal(false)}
                    />
                )}

                <h2 className="flex text-[3rem] lg:text-[4rem] md:text-[5rem] font-extrabold flex-wrap justify-center">
                    <span className="hidden sm:block">
                        Bed<span className="text-purple-300">dit</span>
                    </span>

                    <span className="text-gray-600">/{subeddit.name}</span>
                </h2>

                <h3 className="font-semibold">{subeddit.description}</h3>

                <button
                    className="btn-primary"
                    onClick={() => setShowAddPostModal(true)}
                >
                    Create Post
                </button>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-3 pt-3 w-full lg:w-2/3 md:w-full mx-auto">
                <PostsFeed subeddit={subeddit.name} />
            </div>
        </Layout>
    );
};

export default SubedditPage;
