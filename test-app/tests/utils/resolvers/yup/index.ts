import type * as yup from 'yup';

interface ResolverOptions {
  /**
   * @default async
   */
  mode?: 'async' | 'sync';
  /**
   * @default false
   */
  shouldUseNativeValidation?: boolean;
}

const formatYupError = (errors: Array<yup.ValidationError>) => {
  return errors.reduce((acc: Record<string, unknown[]>, err) => {
    const { type, path, errors, value } = err;

    const formattedError = { type, message: errors.join('\n'), value };

    if (acc[path || 'formidable__error']) {
      acc[path || 'formidable__error']?.push(formattedError);
    } else {
      acc[path ?? 'formidable__error'] = [formattedError];
    }

    return acc;
  }, {});
};

export function yupResolver<TFieldValues extends object = object>(
  schema: yup.ObjectSchema<TFieldValues>,
  options: Parameters<(typeof schema)['validate']>[1] & ResolverOptions = {},
) {
  const { mode = 'async', ...schemaOptions } = options;

  return async (values: object, context: object) => {
    try {
      await schema[mode === 'sync' ? 'validateSync' : 'validate'](
        values,
        Object.assign({ abortEarly: false }, schemaOptions, { context }),
      );

      return {};
    } catch (e) {
      const error = e as yup.ValidationError;

      if (!error.inner) {
        throw error;
      }

      return formatYupError(error.inner);
    }
  };
}
