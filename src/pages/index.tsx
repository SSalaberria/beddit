import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useMutation } from 'react-query';
import AddSubedditModal from 'src/components/subeddits/AddSubedditModal';
import { createSubeddit } from 'src/utils/requests';
import Layout from '../components/layout/Layout';
import PostsFeed from '../components/posts/PostsFeed';

const Home: NextPage = ({}) => {
    const router = useRouter();
    const [showCreateBedditModal, setShowCreateBedditModal] = useState(false);
    const { mutate: createSubedditMutation, error: createError } = useMutation(
        createSubeddit,
        {
            onSuccess: data => {
                setShowCreateBedditModal(false);
                router.push(`/b/${data.name}`);
            },
        },
    );

    return (
        <Layout>
            <Head>
                <title>Beddit: the homepage of the internet</title>
            </Head>
            <div className="flex flex-col justify-center items-center">
                <h2 className="text-[3rem] lg:text-[5rem] md:text-[5rem] font-extrabold">
                    Bed<span className="text-purple-300">dit</span>
                </h2>

                <button
                    className="btn-primary"
                    onClick={() => setShowCreateBedditModal(true)}
                    data-bs-toggle="modal"
                    data-bs-target="#addPostModal"
                >
                    Create a Subeddit
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-3 pt-3 w-full lg:w-2/3 md:w-full mx-auto">
                <PostsFeed />
            </div>

            {showCreateBedditModal && (
                <AddSubedditModal
                    onClose={() => setShowCreateBedditModal(false)}
                    onSubmitSubeddit={createSubedditMutation}
                    // @ts-ignore
                    error={createError?.response?.data?.data?.message}
                />
            )}
        </Layout>
    );
};

export default Home;
