import Head from 'next/head';
import { useEffect, useState } from 'react';
import { ThemeOption } from '../../utils/ts/types';
import Toggle from '../Toggle';
import styles from './layout.module.css';
import Navbar from './Navbar';

type LayoutProps = {
    children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
    const [theme, setTheme] = useState<ThemeOption>();

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    useEffect(() => {
        // @ts-ignore
        setTheme(localStorage.getItem('theme'));
    }, []);

    useEffect(() => {
        if (theme) {
            document.documentElement.className = theme;
            localStorage.setItem('theme', theme);
        }
    }, [theme]);

    return (
        <div className={styles.scrollablePage && 'dark:bg-gray-900'}>
            <Head>
                <title>Beddit</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.container}>
                <div className="absolute right-4 top-4">
                    <Toggle value={theme} onChange={toggleTheme} />
                </div>
                <Navbar />
                {children}
            </main>
            <footer className="flex justify-center h-60 ">Footer</footer>
        </div>
    );
};

export default Layout;