import { useRouter } from 'next/router';
import { useState } from 'react';
import Home from '../..';
import AddPostModal from '../../../components/AddPostModal';
import Layout from '../../../components/layout/Layout';
import PostsFeed from '../../../components/PostsFeed';
import { useAddPostMutation } from '../../../hooks/usePosts';

const SubedditPage = () => {
    const { query } = useRouter();
    const addPostMutation = useAddPostMutation({
        subeddit: String(query.subeddit),
    });
    const [showAddPostModal, setShowAddPostModal] = useState(false);

    const handleSubmitPost = async (data: {
        title: string;
        content: string;
    }) => {
        if (query.subeddit) {
            addPostMutation.mutate({
                ...data,
                subeddit: String(query.subeddit),
            });
        }

        setShowAddPostModal(false);
    };

    return (
        <Layout>
            <div className="flex flex-col justify-center items-center">
                {showAddPostModal && (
                    <AddPostModal
                        onSubmitPost={handleSubmitPost}
                        onClose={() => setShowAddPostModal(false)}
                    />
                )}

                <h2 className="text-[3rem] lg:text-[5rem] md:text-[5rem] font-extrabold text">
                    Bed<span className="text-purple-300">dit</span>
                </h2>

                <button onClick={() => setShowAddPostModal(true)}>
                    Create Post
                </button>

                <p className="text-2xl text">Posts</p>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-3 pt-3 w-full lg:w-2/3 md:w-full mx-auto">
                <PostsFeed />
            </div>
        </Layout>
    );
};

export default SubedditPage;
