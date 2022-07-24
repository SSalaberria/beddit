export interface User {
    id: string;
    name: string;
    email: string;
    image: string;
}

export interface Post {
    id: string;
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
    _count: {
        comments: number;
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
}

export interface Subeddit {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    Posts?: Post[];
}

export interface SubmitPostData {
    title: string;
    content: string;
    subeddit: string;
}
