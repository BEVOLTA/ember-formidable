import * as yup from 'yup';

interface ResolverOptions {
  /**
   * @default async
   */
  mode?: 'async' | 'sync';
  /**
   * Return the raw input values rather than the parsed values.
   * @default false
   */
  raw?: boolean;
  /**
   * @default false
   */
  shouldUseNativeValidation?: boolean;
}

const formatYupError = (errors: Array<yup.ValidationError>) => {
  return errors.reduce((acc: Record<string, any[]>, err) => {
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
  const { mode = 'async', raw = false, ...schemaOptions } = options;

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
