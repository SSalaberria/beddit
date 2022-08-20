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
    subeddit: {
        id: string;
        name: string;
    };
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
    content: string;
    author: User;
    authorId: string;
    post: Post;
    postId: string;
    parent?: Comment;
    parentId?: string;
    createdAt: string;
    updatedAt: string;
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
