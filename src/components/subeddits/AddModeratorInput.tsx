import { useState, useRef, useCallback, useMemo } from 'react';
import Autocomplete from 'src/components/common/Autocomplete';
import { useUserSearch } from 'src/hooks/useUserSearch';
import Dialog from 'src/components/common/Dialog';
import { CogIcon } from '@heroicons/react/outline';

interface Props {
    onAddModerator: (username: string) => void;
}

const AddModeratorInput = ({ onAddModerator }: Props) => {
    const [userSearchInput, setUserSearchInput] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const selectedUser = useRef<string | null>(null);
    const { data: userOptions } = useUserSearch({ username: userSearchInput });

    const parsedUserOptions = useMemo(
        () => (userOptions ? userOptions.map(user => user.name) : []),
        [userOptions],
    );

    const handleSelectUser = useCallback((username: string) => {
        selectedUser.current = username;
        setShowConfirmModal(true);
    }, []);

    const handleChangeUserQuery = useCallback(
        (query: string) => setUserSearchInput(query),
        [],
    );

    const handleConfirm = useCallback(() => {
        if (selectedUser.current) {
            onAddModerator(selectedUser.current);
            setShowConfirmModal(false);
        }
    }, []);

    return (
        <>
            <Autocomplete
                options={parsedUserOptions}
                onChange={handleChangeUserQuery}
                onSelect={handleSelectUser}
                placeholder="Add moderators..."
                autoComplete="off"
                startIcon={<CogIcon className="h-6 w-6 text-gray-400" />}
            />
            {showConfirmModal && (
                <Dialog
                    title={`Are you sure you want to mod ${selectedUser.current}?`}
                    onClose={() => setShowConfirmModal(false)}
                >
                    <div className="flex items-center flex-col-reverse sm:flex-row justify-end py-6 px-6 gap-10 rounded-b border-t border-gray-200 dark:border-gray-600">
                        <button
                            type="button"
                            className="btn-secondary w-full"
                            onClick={() => setShowConfirmModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn-primary w-full"
                            onClick={handleConfirm}
                        >
                            Confirm
                        </button>
                    </div>
                </Dialog>
            )}
        </>
    );
};

export default AddModeratorInput;
