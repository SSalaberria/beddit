import { memo, useState } from 'react';
import { Comment } from '../../utils/ts/interfaces';
import CommentForm from './CommentForm';
import { UserCircleIcon } from '@heroicons/react/outline';
import { formatDate } from '../../utils/date';
import Voting from '../common/Voting';
import { VoteOption } from 'src/utils/ts/types';

interface Props {
    comment: Comment;
    parent?: Comment;
    depth: number;
    loggedUserId?: string;
    showModActions: boolean;
    onSaveComment: (formData: {
        content: string;
        depth: number;
        parentId?: string;
    }) => void;
    onVote: (voteData: { commentId: string; voteType: VoteOption }) => void;
    onDelete: (commentId: string) => void;
}

const Comment = ({
    comment,
    parent,
    showModActions,
    onSaveComment,
    onVote,
    onDelete,
    depth,
    loggedUserId,
}: Props) => {
    const [showReplyForm, setShowReplyForm] = useState(false);

    return (
        <div
            className={`flex flex-col bg-slate-100 border-gray-200  dark:border-gray-600 border rounded p-3 my-2 gap-2 ${
                depth % 2 === 0 ? 'comment-primary' : 'comment-secondary'
            }`}
        >
            <div className="flex items-center gap-2">
                <UserCircleIcon className="h-8" />
                <div>
                    <p>{comment?.author?.name}</p>
                    <p className="text-sm">
                        {formatDate(comment.createdAt, {
                            dateStyle: 'long',
                            timeStyle: 'short',
                        })}
                    </p>
                </div>
                <div className="flex ml-auto">
                    <Voting
                        total={comment.voteCount}
                        vote={comment?.userVote && comment?.userVote?.voteType}
                        disabled={Boolean(comment.deletedAt)}
                        onVote={vote =>
                            onVote({ commentId: comment.id, voteType: vote })
                        }
                        // TODO - add vote DELETE action
                        onVoteDelete={() => console.log()}
                    />
                </div>
            </div>
            <p className={!comment.content ? 'italic text-gray-400' : ''}>
                {comment.content ?? 'This comment has been deleted.'}
            </p>
            <div className="mt-2">
                <div>
                    {showReplyForm && (
                        <div className="fadeIn">
                            <CommentForm
                                onSaveComment={formData =>
                                    onSaveComment({
                                        ...formData,
                                        depth: depth + 1,
                                        parentId: comment?.id,
                                    })
                                }
                                onCancel={() => setShowReplyForm(false)}
                            />
                        </div>
                    )}
                </div>
                {!showReplyForm && !comment.deletedAt && (
                    <button
                        className="btn-secondary py-1"
                        onClick={() => setShowReplyForm(true)}
                    >
                        Reply
                    </button>
                )}

                {((loggedUserId === comment.authorId && !comment.deletedAt) ||
                    showModActions) && (
                    <button
                        className="btn-secondary py-1"
                        onClick={() => onDelete(comment.id)}
                    >
                        Delete
                    </button>
                )}

                {comment.children?.map(child => (
                    <Comment
                        comment={child}
                        parent={comment}
                        onSaveComment={onSaveComment}
                        onDelete={onDelete}
                        loggedUserId={loggedUserId}
                        showModActions={showModActions}
                        onVote={onVote}
                        depth={depth + 1}
                        key={child.id}
                    />
                ))}
            </div>
        </div>
    );
};

export default memo(Comment);
