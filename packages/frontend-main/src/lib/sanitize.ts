import type { TSchema } from '@sinclair/typebox';
import type { Static } from '@sinclair/typebox';
import type { ValueError } from '@sinclair/typebox/compiler';

import { TypeCompiler } from '@sinclair/typebox/compiler';

export function validateOrNull<T extends TSchema>(
    schema: T,
    data: unknown,
): Static<T> | null {
    const validator = TypeCompiler.Compile(schema);
    if (validator.Check(data)) {
        return data as Static<T>;
    }
    else {
        console.warn('Validation errors:', [...validator.Errors(data)] as ValueError[]);
        return null;
    }
}
