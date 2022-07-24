export const formatDate = (
    date: string,
    formatOptions: Intl.DateTimeFormatOptions,
): string => {
    return Intl.DateTimeFormat('en-US', formatOptions).format(new Date(date));
};
