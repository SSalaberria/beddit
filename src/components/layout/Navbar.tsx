import { signIn, useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import RegisterDialog from '../common/RegisterDialog';
import { useState } from 'react';
import Logo from '../common/Logo';

const Navbar = () => {
    const { data: session } = useSession();
    const [registerModalOpen, setRegisterModalOpen] = useState(false);

    return (
        <>
            <nav className="w-full flex justify-between items-center">
                <div className="flex">
                    <Link href="/">
                        <a className="flex items-center">
                            <Logo width={32} height={32} />
                        </a>
                    </Link>
                </div>
                <div>
                    {session ? (
                        <div className="flex flex-col items-end">
                            <p className="text-md ">
                                Hello, {session?.user?.name}
                            </p>
                            <button onClick={() => signOut()}>Logout</button>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <button onClick={() => setRegisterModalOpen(true)}>
                                Register
                            </button>
                            <button onClick={() => signIn()}>Sign in</button>
                        </div>
                    )}
                </div>
            </nav>
            {registerModalOpen && (
                <RegisterDialog onClose={() => setRegisterModalOpen(false)} />
            )}
        </>
    );
};

export default Navbar;
