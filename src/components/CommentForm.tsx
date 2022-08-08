interface Props {
    onSaveComment: (formData: { content: string }) => void;
    onCancel?: () => void;
}

const CommentForm = ({ onSaveComment, onCancel }: Props) => {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const target = e.target as HTMLFormElement;

        const formData = {
            content: target.content.value,
        };

        onSaveComment(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                name="content"
                id="content"
                className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white "
                placeholder="Share your thoughts..."
                rows={6}
                maxLength={4094}
                required
            />
            <div className="flex justify-end mt-4">
                {onCancel && (
                    <button
                        className="btn-secondary"
                        onClick={onCancel}
                        type="reset"
                    >
                        Cancel
                    </button>
                )}
                <button className="btn-primary" type="submit">
                    Save comment
                </button>
            </div>
        </form>
    );
};

export default CommentForm;
