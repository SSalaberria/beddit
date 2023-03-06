import { VoteOption } from 'src/utils/ts/types';
import {
    ArrowCircleDownIcon,
    ArrowCircleUpIcon,
} from '@heroicons/react/outline';
import { useCallback } from 'react';

interface Props {
    total: number;
    vote?: VoteOption | null;
    disabled?: boolean;
    onVote: (vote: VoteOption) => void;
    onVoteDelete: () => void;
}

const Voting = ({ total, vote, disabled, onVote, onVoteDelete }: Props) => {
    const handleVoteAction = useCallback(
        (selectedVoteOption: VoteOption) => {
            if (selectedVoteOption === vote) {
                onVoteDelete();
            } else {
                onVote(selectedVoteOption);
            }
        },
        [vote],
    );

    return (
        <div className="flex items-center">
            <div>{total}</div>
            <div className="flex flex-col ">
                <button onClick={() => handleVoteAction(1)} disabled={disabled}>
                    <ArrowCircleUpIcon
                        className={`h-8 clickable  hover:fill-purple-300 ${
                            vote === 1 && 'fill-purple-300'
                        }`}
                    />
                </button>

                <button
                    onClick={() => handleVoteAction(-1)}
                    disabled={disabled}
                >
                    <ArrowCircleDownIcon
                        className={`h-8 clickable hover:fill-blue-300 ${
                            vote === -1 && 'fill-blue-300'
                        }`}
                    />
                </button>
            </div>
        </div>
    );
};

export default Voting;
