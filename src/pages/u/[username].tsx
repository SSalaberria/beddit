import { useRouter } from 'next/router';
import Layout from 'src/components/layout/Layout';
import PostsFeed from 'src/components/posts/PostsFeed';

const UserPage = () => {
    const router = useRouter();

    return (
        <Layout>
            <div className="flex flex-col items-center">
                <h2 className="text-[1.5rem] sm:text-[2rem] font-extrabold text">
                    u/
                    <span className="text-purple-300">
                        {router?.query.username}
                    </span>
                </h2>
                <div className="grid grid-cols-1 gap-3 mt-3 pt-3 w-full lg:w-2/3 md:w-full mx-auto">
                    <PostsFeed username={router?.query.username as string} />
                </div>
            </div>
        </Layout>
    );
};

export default UserPage;
