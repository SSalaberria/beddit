import Dialog from '../common/Dialog';

interface Props {
    onClose: () => void;
    onSubmitSubeddit: (data: { name: string; description: string }) => void;
    error?: string;
}

const AddSubedditModal = ({ onClose, onSubmitSubeddit, error }: Props) => {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const target = e.target as HTMLFormElement;

        const formData = {
            // @ts-ignore
            name: String(target.title.value.toLowerCase()),
            description: String(target.description.value),
        };

        onSubmitSubeddit(formData);
    };

    return (
        <Dialog title={'Create your own subeddit'} onClose={onClose}>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                    <div>
                        <label
                            htmlFor="title"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                            Name
                        </label>
                        <input
                            name="title"
                            id="title"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white "
                            placeholder="Your subeddit's name"
                            minLength={4}
                            maxLength={24}
                            required
                        />

                        {Boolean(error) && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                    </div>
                    <textarea
                        name="description"
                        id="description"
                        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white hover:border-slate-400 dark:hover:border-slate-100 transition-height duration-300 ease-in-out`}
                        placeholder={`Describe your subeddit's intent`}
                        rows={3}
                        minLength={12}
                        maxLength={64}
                        required
                    />
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

export default AddSubedditModal;
