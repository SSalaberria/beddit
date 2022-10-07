import { useState } from 'react';
import { CONTENT_TYPES } from 'src/utils/consts';
import { ContentType } from 'src/utils/ts/types';
import Dialog from '../common/Dialog';

type Props = {
    onClose: () => void;
    onSubmitPost: (data: {
        title: string;
        content: string;
        contentType: ContentType;
    }) => void;
};

const AddPostModal = ({ onClose, onSubmitPost }: Props) => {
    const [contentType, setContentType] = useState<ContentType>(
        CONTENT_TYPES.TEXT,
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const target = e.target as HTMLFormElement;

        const formData = {
            // @ts-ignore
            title: target.title.value,
            content: target.content.value,
            contentType,
        };

        onSubmitPost(formData);
    };

    return (
        <Dialog title={'Add post'} onClose={onClose}>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                    <div>
                        <label
                            htmlFor="title"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                            Title
                        </label>
                        <input
                            name="title"
                            id="title"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white "
                            placeholder="Today I saw something amazing!"
                            minLength={4}
                            maxLength={255}
                            required
                        />
                    </div>
                    <div>
                        <div className="flex mb-2">
                            {Object.values(CONTENT_TYPES).map(type => (
                                <div
                                    className="flex items-center mr-4"
                                    key={type}
                                    onClick={() => setContentType(type)}
                                >
                                    <input
                                        id={type}
                                        type="radio"
                                        value={type}
                                        name="inline-radio-group"
                                        className="radio-primary"
                                        checked={type === contentType}
                                    />
                                    <label
                                        htmlFor={type}
                                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer"
                                    >
                                        {type}
                                    </label>
                                </div>
                            ))}
                        </div>

                        <textarea
                            name="content"
                            id="content"
                            className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white hover:border-slate-400 dark:hover:border-slate-100 transition-height duration-300 ease-in-out`}
                            placeholder={
                                contentType === CONTENT_TYPES.IMAGE
                                    ? 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Khruangbin.jpg'
                                    : contentType === CONTENT_TYPES.VIDEO
                                    ? 'https://www.youtube.com/watch?v=lo4KMGiy--Y'
                                    : 'There was this huge tree...'
                            }
                            rows={contentType === CONTENT_TYPES.TEXT ? 10 : 1}
                            minLength={12}
                            maxLength={4094}
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center flex-col-reverse sm:flex-row justify-end p-6 rounded-b border-t border-gray-200 dark:border-gray-600">
                    <button
                        type="button"
                        className="btn-secondary w-full sm:w-auto"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary w-full sm:w-auto"
                    >
                        Create
                    </button>
                </div>
            </form>
        </Dialog>
    );
};

export default AddPostModal;
