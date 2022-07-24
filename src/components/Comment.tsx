import { useState } from 'react';
import { Comment } from '../utils/ts/interfaces';
import CommentForm from './CommentForm';
import { UserCircleIcon } from '@heroicons/react/outline';
import { formatDate } from '../utils/date';

interface Props {
    comment: Comment;
    parent?: Comment;
    depth: number;
    onSaveComment: (formData: {
        content: string;
        depth: number;
        parentId?: string;
    }) => void;
}

const Comment = ({ comment, parent, onSaveComment, depth }: Props) => {
    const [showReplyForm, setShowReplyForm] = useState(false);

    return (
        <div
            className={`flex flex-col bg-slate-${
                depth % 2 ? 200 : 100
            } border-gray-200 dark:bg-slate-${
                depth % 2 ? 700 : 800
            } dark:border-gray-600 border rounded p-3 my-2 gap-2`}
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
            </div>
            <p className="">{comment.content}</p>
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
                {!showReplyForm && (
                    <>
                        <button
                            className="btn-secondary py-1"
                            onClick={() => setShowReplyForm(true)}
                        >
                            Reply
                        </button>
                    </>
                )}

                {comment.children?.map(child => (
                    <Comment
                        comment={child}
                        parent={comment}
                        onSaveComment={onSaveComment}
                        depth={depth + 1}
                        key={child.id}
                    />
                ))}
            </div>
        </div>
    );
};

export default Comment;
