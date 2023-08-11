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
