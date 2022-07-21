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
}

export interface SubmitPostData {
    title: string;
    content: string;
    subeddit: string;
}
