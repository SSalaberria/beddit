import { VoteOption } from 'src/utils/ts/types';
import {
    ArrowCircleDownIcon,
    ArrowCircleUpIcon,
} from '@heroicons/react/outline';
import { useCallback } from 'react';

interface Props {
    total: number;
    vote?: VoteOption | null;
    onVote: (vote: VoteOption) => void;
    onVoteDelete: () => void;
}

const Voting = ({ total, vote, onVote, onVoteDelete }: Props) => {
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
                <ArrowCircleUpIcon
                    className={`h-8 clickable  hover:fill-purple-300 ${
                        vote === 1 && 'fill-purple-300'
                    }`}
                    onClick={() => handleVoteAction(1)}
                />
                <ArrowCircleDownIcon
                    className={`h-8 clickable hover:fill-blue-300 ${
                        vote === -1 && 'fill-blue-300'
                    }`}
                    onClick={() => handleVoteAction(-1)}
                />
            </div>
        </div>
    );
};

export default Voting;
