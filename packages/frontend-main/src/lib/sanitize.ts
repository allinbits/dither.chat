import type { TSchema } from '@sinclair/typebox';
import type { Static } from '@sinclair/typebox';
import type { ValueError } from '@sinclair/typebox/compiler';

import { TypeCompiler } from '@sinclair/typebox/compiler';

export function checkTypeboxSchema<T extends TSchema>(
    schema: T,
    data: unknown,
): Static<T> | null {
    const typeChecker = TypeCompiler.Compile(schema);
    if (typeChecker.Check(data)) {
        return data as Static<T>;
    }
    else {
        console.warn('Validation errors:', [...typeChecker.Errors(data)] as ValueError[]);
        return null;
    }
}
