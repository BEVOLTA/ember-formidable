import { assert } from '@ember/debug';

import type { FormidableErrors } from './';
import type { GenericObject, ResolverOptions, ValueKey } from './types';
import type * as yup from 'yup';

const formatYupError = (errors: Array<yup.ValidationError>) => {
  return errors.reduce((acc: FormidableErrors, err) => {
    const { type, path, errors, value } = err;

    const formattedError = { type: type ?? 'unknown', message: errors.join('\n'), value };

    assert('FORMIDABLE - Error - We could not find any path', !!path);

    if (acc[path]) {
      acc[path]?.push(formattedError);
    } else {
      acc[path] = [formattedError];
    }

    return acc;
  }, {});
};

export const yupResolver = <
  Values extends GenericObject = GenericObject,
  ValidatorOptions extends GenericObject = GenericObject,
>(
  schema: yup.ObjectSchema<Values>,
  options: Parameters<(typeof schema)['validate']>[1] &
    ResolverOptions<ValidatorOptions> = {} as ResolverOptions<ValidatorOptions>,
): ((
  values: Values,
  context: ResolverOptions<ValidatorOptions>,
) => Promise<FormidableErrors<ValueKey<Values>>>) => {
  const { mode = 'async', ...schemaOptions } = options;

  return async (
    values: Values,
    context: ResolverOptions<ValidatorOptions>,
  ): Promise<FormidableErrors<ValueKey<Values>>> => {
    try {
      await schema[mode === 'sync' ? 'validateSync' : 'validate'](
        values,
        Object.assign({ abortEarly: false }, schemaOptions, { context }),
      );

      return {} as FormidableErrors<keyof Values>;
    } catch (e) {
      const error = e as yup.ValidationError;

      if (!error.inner) {
        throw error;
      }

      return formatYupError(error.inner);
    }
  };
};
