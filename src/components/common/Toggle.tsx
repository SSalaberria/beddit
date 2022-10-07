const Toggle = ({
    value,
    onChange,
}: {
    value: string | undefined;
    onChange: (e?: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
    return (
        <label
            htmlFor="default-toggle"
            className="toggle relative inline-flex items-center cursor-pointer right-4"
        >
            <input
                type="checkbox"
                value={value}
                id="default-toggle"
                className="sr-only peer"
                onChange={onChange}
            />
            <div
                className={`w-11 h-6 bg-gray-200 dark:bg-purple-300 rounded-full peer after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 ${
                    value === 'dark' &&
                    "after:translate-x-full after:border-white after:content-['']"
                }`}
            ></div>
        </label>
    );
};

export default Toggle;
