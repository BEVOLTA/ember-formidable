import * as Yup from 'yup';

const formatYupError = (errors: Array<Yup.ValidationError>) => {
  return errors.reduce((acc: Record<string, any[]>, err) => {
    const { type, path, errors, value } = err;

    const formattedError = { type, message: errors.join('\n'), value };

    if (acc[path || 'formidable__unknown']) {
      acc[path || 'formidable__unknown']?.push(formattedError);
    } else {
      acc[path ?? 'unknown'] = [formattedError];
    }
    return acc;
  }, {});
};

export function yupResolver<TFieldValues extends object = {}>(
  schema: Yup.ObjectSchema<TFieldValues>,
  schemaOptions: Parameters<(typeof schema)['validate']>[1] = {},
  resolverOptions: {
    /**
     * @default async
     */
    mode?: 'async' | 'sync';
    /**
     * Return the raw input values rather than the parsed values.
     * @default false
     */
    raw?: boolean;
  } = {}
) {
  return async (values: object, context: object) => {
    try {
      await schema[
        resolverOptions.mode === 'sync' ? 'validateSync' : 'validate'
      ](
        values,
        Object.assign({ abortEarly: false }, schemaOptions, { context })
      );

      return {};
    } catch (e: any) {
      if (!e.inner) {
        throw e;
      }

      return formatYupError(e.inner);
    }
  };
}
