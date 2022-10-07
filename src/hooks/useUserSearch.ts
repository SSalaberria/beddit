import { useQuery } from 'react-query';
import { fetchUserSearch } from 'src/utils/requests';

export function useUserSearch(params: { username: string }) {
    const userQuery = useQuery(
        ['user', params],
        () => fetchUserSearch(params),
        {
            staleTime: Infinity,
            enabled: Boolean(params?.username),
        },
    );

    return userQuery;
}
