// Types for compiled templates
import 'ember-source/types';
import 'ember-source/types/preview';
import '@glint/environment-ember-loose';

import type { HelperLike } from '@glint/template';
import type FormidableRegistry from 'ember-formidable/template-registry';
declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry extends FormidableRegistry {
    // Add any registry entries from other addons here that your addon itself uses (in non-strict mode templates)
    // See https://typed-ember.gitbook.io/glint/using-glint/ember/using-addons
    'page-title': HelperLike<{ Args: { Positional: [string] }; Return: string }>;
  }
}
