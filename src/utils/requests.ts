import httpClient from './http';
import { Post, Subeddit, User } from './ts/interfaces';

export const fetchSubeddits = async (): Promise<{
    subeddits: Subeddit[];
}> => httpClient.get(`/subeddit`).then(res => res.data);

export const fetchSubedditData = async ({
    name,
}: {
    name: string;
}): Promise<Subeddit> =>
    httpClient.get(`/subeddit/${name}`).then(res => res.data);

export const fetchPost = async (
    { id }: { id: number },
    headers: {},
): Promise<Post> =>
    httpClient.get(`/post/${id}`, { headers }).then(res => res.data);

export const fetchUserSearch = async (params: {
    username: string;
}): Promise<User[]> =>
    httpClient.get(`/user/search`, { params }).then(res => res.data);

export const createSubeddit = async ({
    name,
    description,
}: {
    name: string;
    description: string;
}): Promise<Subeddit> =>
    httpClient.post(`/subeddit`, { name, description }).then(res => res.data);

export const addSubedditModerator = async ({
    username,
    subedditName,
}: {
    username: string;
    subedditName: string;
}): Promise<User> =>
    httpClient
        .put(`/subeddit/${subedditName}/moderators`, { username })
        .then(res => res.data);
