interface Props {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

const Dialog = ({ children, title, onClose }: Props) => (
    <div
        className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-10 h-full w-full transition-all duration-300"
        onClick={onClose}
    >
        <div
            className="relative p-4 w-full max-w-xl h-full md:h-auto mx-auto z-10 fadeIn"
            onClick={e => e.stopPropagation()}
        >
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <div className="flex justify-between items-start p-4 rounded-t border-b dark:border-gray-600">
                    <h3 className="text-xl text-center font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                </div>
                {children}
            </div>
        </div>
    </div>
);

export default Dialog;
