import Image, { ImageProps } from 'next/image';

const Logo = (props: Partial<ImageProps>) => {
    return (
        <>
            <div className="dark:hidden">
                <Image {...props} src="/images/bd-logo.svg" />
            </div>
            <div className="hidden dark:block">
                <Image {...props} src="/images/bd-logo-dark.svg" />
            </div>
        </>
    );
};

export default Logo;
