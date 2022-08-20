import httpClient from './http';
import { Post, Subeddit } from './ts/interfaces';

export const fetchSubeddits = async (): Promise<{
    subeddits: Subeddit[];
}> => {
    return httpClient.get(`/subeddit`).then(res => res.data);
};

export const fetchSubedditData = async ({
    name,
}: {
    name: string;
}): Promise<Subeddit> => {
    return httpClient.get(`/subeddit/${name}`).then(res => res.data);
};

export const fetchPost = async (
    { id }: { id: number },
    headers: {},
): Promise<Post> => {
    return httpClient.get(`/post/${id}`, { headers }).then(res => res.data);
};
