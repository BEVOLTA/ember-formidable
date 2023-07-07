import * as Yup from 'yup';

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
  } = {},
) {
  return async (values: object, context: object) => {
    try {
      await schema[
        resolverOptions.mode === 'sync' ? 'validateSync' : 'validate'
      ](
        values,
        Object.assign({ abortEarly: false }, schemaOptions, { context }),
      );

      return {};
    } catch (e: any) {
      if (!e.inner) {
        throw e;
      }

      return e;
    }
  };
}
