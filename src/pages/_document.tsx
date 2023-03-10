import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    // Required to avoid theme FOUC
    const setInitialTheme = `
        function getUserPreference() {
            if(window.localStorage.getItem('theme')) {
                return window.localStorage.getItem('theme')
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
            }
            document.documentElement.className = getUserPreference();
    `;

    return (
        <Html>
            <Head>
                <meta
                    name="description"
                    content="Beddit, a place to share news and opinions on different topics."
                />
                <link
                    rel="shortcut icon"
                    href="/images/bd-logo-dark.svg"
                    type="image/svg+xml"
                />
            </Head>
            <body>
                <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
