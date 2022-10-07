import { Subeddit } from './../utils/ts/interfaces';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { addSubedditModerator, fetchSubedditData } from 'src/utils/requests';

export function useAddModeratorMutation(params: { name: string }) {
    const queryClient = useQueryClient();

    return useMutation(addSubedditModerator, {
        onSuccess: data => {
            queryClient.setQueryData<Subeddit>(
                ['subeddit', params.name],
                // @ts-ignore
                (prevData: Subeddit | undefined) => ({
                    ...prevData,
                    moderators: [...(prevData?.moderators || []), data],
                }),
            );
        },
    });
}

export function useSubeddit(params: { name: string }) {
    const subedditQuery = useQuery(
        ['subeddit', params.name],
        () => fetchSubedditData(params),
        {
            staleTime: Infinity,
        },
    );

    return subedditQuery;
}
