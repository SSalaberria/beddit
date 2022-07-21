export const formatDate = (
    date: string,
    formatOptions: Intl.DateTimeFormatOptions,
): string => {
    return Intl.DateTimeFormat('es-AR', formatOptions).format(new Date(date));
};
