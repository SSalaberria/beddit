import Axios from 'axios';

const httpClient = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export default httpClient;
