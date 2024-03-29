import debounce from 'lodash.debounce';
import { useCallback, useState, useRef, memo } from 'react';

interface AutocompleteProps {
    options?: string[];
    onChange?: (input: string) => void;
    onSelect?: (option: string) => void;
    onSubmit?: (value: string) => void;
    isLoading?: boolean;
    startIcon?: JSX.Element;
    [key: string]: any;
}

const Autocomplete = ({
    options,
    onChange,
    onSelect,
    onSubmit,
    isLoading,
    startIcon,
    ...props
}: AutocompleteProps) => {
    const [focused, setFocused] = useState(false);
    const [input, setInput] = useState('');

    const debouncedInput = useCallback(
        debounce((e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.value && onChange) {
                onChange(e.target.value);
            }
        }, 300),
        [],
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (onSubmit) onSubmit(input);

        const option = options && options.find(option => option === input);
        if (onSelect && option) {
            onSelect(option);
        }
    };

    return (
        <div className="w-full relative">
            <form onSubmit={handleSubmit} noValidate>
                <label
                    htmlFor="default-search"
                    className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300"
                >
                    Search
                </label>
                <div className="relative">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        {isLoading ? (
                            <svg
                                aria-hidden="true"
                                className="mr-2 w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                viewBox="0 0 100 101"
                                fill="none"
                            >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="#d8b4fe"
                                />
                            </svg>
                        ) : (
                            <>
                                {startIcon ?? (
                                    <svg
                                        aria-hidden="true"
                                        className="w-5 h-5 text-gray-500 dark:text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        ></path>
                                    </svg>
                                )}
                            </>
                        )}
                    </div>
                    <input
                        type="search"
                        value={input}
                        onChange={e => {
                            setInput(e.target.value);
                            debouncedInput(e);
                        }}
                        onFocus={e => setFocused(true)}
                        onBlur={e => setTimeout(() => setFocused(false), 150)}
                        id="default-search"
                        className="block p-2 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg  border-gray-300  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        required
                        {...props}
                    />
                </div>
            </form>
            {focused && options && (
                <div className="absolute border rounded-b-md w-full dark:border-gray-700">
                    {options.map(option => (
                        <div
                            className="  hover:bg-gray-300 dark:hover:bg-gray-600 bg-gray-50 dark:bg-gray-800 cursor-pointer z-10 p-1"
                            key={option}
                            onClick={() => {
                                setFocused(false);
                                setInput(option);
                                if (onSelect) onSelect(option);
                            }}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default memo(Autocomplete);
