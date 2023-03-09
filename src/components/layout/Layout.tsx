import { useEffect, useState } from 'react';
import { ThemeOption } from '../../utils/ts/types';
import Toggle from '../common/Toggle';
import styles from './layout.module.css';
import Navbar from './Navbar';
import pinnedSubeddits from 'src/utils/data/pinned-subeddits.json';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';

const DynamicToggle = dynamic(() => Promise.resolve(Toggle), { ssr: false });

type LayoutProps = {
    children: React.ReactNode;
};

const initThemeState = () => {
    if (typeof window !== 'undefined')
        return (localStorage?.getItem('theme') as ThemeOption) || 'light';
    else return 'light';
};

const Layout = ({ children }: LayoutProps) => {
    const [theme, setTheme] = useState<ThemeOption>(initThemeState);
    const { status } = useSession();

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    useEffect(() => {
        if (theme) {
            document.documentElement.className = theme;
            localStorage.setItem('theme', theme);
        }
    }, [theme]);

    return (
        <div className={styles.scrollablePage && 'dark:bg-gray-900'}>
            <div className="flex justify-center flex-wrap pt-2 gap-4">
                {status !== 'loading' &&
                    pinnedSubeddits.map(sub => (
                        <Link href={`/b/${sub}`} key={sub}>
                            <a>
                                <p key={sub} className="font-bold clickable">
                                    {sub}
                                </p>
                            </a>
                        </Link>
                    ))}
            </div>
            <main className={styles.container}>
                {status !== 'loading' ? (
                    <>
                        <div className="absolute right-4 top-10">
                            <DynamicToggle
                                value={theme}
                                onChange={toggleTheme}
                            />
                        </div>
                        <div className="mb-12">
                            <Navbar />
                        </div>
                        {children}{' '}
                    </>
                ) : (
                    <div className="flex h-full justify-center my-auto text-[6rem] lg:text-[5rem] md:text-[5rem] font-extrabold">
                        <h2 className="relative">
                            {'Beddit'.split('').map((char, index) => (
                                <span
                                    className={`animated-text ${
                                        index > 2 && 'text-purple-300'
                                    }`}
                                    style={{
                                        animationDelay: `${0.3 + index / 10}s`,
                                    }}
                                >
                                    {char}
                                </span>
                            ))}
                        </h2>
                    </div>
                )}
            </main>
            {status !== 'loading' && (
                <footer className="flex justify-center h-60 ">
                    Made with ❤️ by Sebastián Salaberría
                </footer>
            )}
        </div>
    );
};

export default Layout;
