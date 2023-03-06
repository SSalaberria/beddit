import { VoteOption, ContentType } from 'src/utils/ts/types';
export interface User {
    id: string;
    name: string;
    email: string;
    image: string;
}

export interface Post {
    id: number;
    title: string;
    content: string;
    author: User;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    subeddit: Subeddit;
    comments: Comment[];
    commentsDepth: number;
    votes?: Vote[];
    contentType: ContentType;
    _count: {
        comments: number;
        votes: number;
        votesSum: number;
    };
}

export interface Comment {
    id: string;
    content: string | null;
    author: User;
    authorId: string;
    post: Post;
    postId: string;
    parent?: Comment;
    parentId?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    children: Comment[];
    votes?: Vote[];
    userVote: Vote | null;
    voteCount: number;
}

export interface Subeddit {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    Posts?: Post[];
    moderators?: User[];
    owner?: User;
}

export interface Vote {
    id: string;
    authorId: string;
    voteType: VoteOption;
}

export interface SubmitPostData {
    title: string;
    content: string;
    subeddit: string;
}
