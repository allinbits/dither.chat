import type z from 'zod';

export const zodTryParse = <T extends z.ZodType>(
    zodSchema: T,
    data: unknown,
): z.infer<T> | null => {
    const result = zodSchema.safeParse(data);
    if (result.success) {
        return result.data;
    }
    return null;
};
