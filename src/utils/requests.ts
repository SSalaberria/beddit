import httpClient from './http';
import { Post, Subeddit } from './ts/interfaces';

interface fetchSubedditsResponse {
    subeddits: Subeddit[];
}

export const fetchSubeddits = async (): Promise<fetchSubedditsResponse> => {
    return httpClient.get(`/subeddit`).then(res => res.data);
};

export const fetchSubedditData = async ({
    name,
}: {
    name: string;
}): Promise<Subeddit> => {
    return httpClient.get(`/subeddit/${name}`).then(res => res.data);
};

export const fetchPost = async ({ id }: { id: number }): Promise<Post> => {
    return httpClient.get(`/post/${id}`).then(res => res.data);
};
