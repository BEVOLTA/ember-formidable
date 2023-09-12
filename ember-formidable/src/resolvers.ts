import { assert } from '@ember/debug';

import _get from 'lodash/get';
import _set from 'lodash/set';

import type { FormidableErrors } from './';
import type { GenericObject, ResolverOptions, ValueKey } from './types';
import type * as yup from 'yup';

const formatYupError = (errors: Array<yup.ValidationError>) => {
  return errors.reduce((acc: FormidableErrors, err) => {
    const { type, path, errors, value } = err;

    const formattedError = { type: type ?? 'unknown', message: errors.join('\n'), value };

    assert('FORMIDABLE - Error - We could not find any path', !!path);

    if (_get(acc, path)) {
      _set(acc, path, [..._get(acc, path), formattedError]);
    } else {
      _set(acc, path, [formattedError]);
    }

    return acc;
  }, {});
};

export const yupValidator = <
  Values extends GenericObject = GenericObject,
  ValidatorOptions extends GenericObject = GenericObject,
>(
  schema: yup.ObjectSchema<Partial<Values> | Values>,
  options: Parameters<(typeof schema)['validate']>[1] &
    ResolverOptions<ValidatorOptions> = {} as ResolverOptions<ValidatorOptions>,
): ((
  values: Partial<Values> | Values,
  context: ResolverOptions<ValidatorOptions>,
) => Promise<FormidableErrors<ValueKey<Values>>>) => {
  const { mode = 'async', ...schemaOptions } = options;

  return async (
    values: Partial<Values> | Values,
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
