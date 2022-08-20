import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import PostsFeed from '../components/PostsFeed';

const Home: NextPage = ({}) => {
    return (
        <Layout>
            <Head>
                <title>Beddit: the homepage of the internet</title>
            </Head>
            <div className="flex flex-col justify-center items-center">
                <h2 className="text-[3rem] lg:text-[5rem] md:text-[5rem] font-extrabold text">
                    Bed<span className="text-purple-300">dit</span>
                </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-3 pt-3 w-full lg:w-2/3 md:w-full mx-auto">
                <PostsFeed />
            </div>
        </Layout>
    );
};

export default Home;
