import { assert } from '@ember/debug';
import _get from 'lodash/get';
import _set from 'lodash/set';

const formatYupError = errors => {
  return errors.reduce((acc, err) => {
    const {
      type,
      path,
      errors,
      value
    } = err;
    const formattedError = {
      type: type ?? 'unknown',
      message: errors.join('\n'),
      value
    };
    assert('FORMIDABLE - Error - We could not find any path', !!path);
    if (_get(acc, path)) {
      _set(acc, path, [..._get(acc, path), formattedError]);
    } else {
      _set(acc, path, [formattedError]);
    }
    return acc;
  }, {});
};
const yupValidator = (schema, options = {}) => {
  const {
    mode = 'async',
    ...schemaOptions
  } = options;
  return async (values, context) => {
    try {
      await schema[mode === 'sync' ? 'validateSync' : 'validate'](values, Object.assign({
        abortEarly: false
      }, schemaOptions, {
        context
      }));
      return {};
    } catch (e) {
      const error = e;
      if (!error.inner) {
        throw error;
      }
      return formatYupError(error.inner);
    }
  };
};

export { yupValidator };
//# sourceMappingURL=resolvers.js.map
