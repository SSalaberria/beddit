import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
    const { data: session } = useSession();

    return (
        <nav className="w-full flex justify-between items-center">
            <div className="flex">
                <Link href="/">
                    <a className="flex items-center">
                        <Image
                            src="/images/bd-logo.svg"
                            width={32}
                            height={32}
                        />
                    </a>
                </Link>
            </div>
            <div>
                {session ? (
                    <p className="text-md ">Hello, {session?.user?.name}</p>
                ) : (
                    <button onClick={() => signIn()}>Sign in</button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
