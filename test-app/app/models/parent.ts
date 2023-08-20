import Model, { attr, belongsTo } from 'ember-data/model';

import ChildModel from './child';

export default class ParentModel extends Model {
  @attr('string') str!: string;
  @attr('boolean') bool!: boolean;
  @attr('number') num!: number;
  @attr('date') date!: Date;
  @attr({ defaultValue: () => ({}) }) obj!: object;

  @belongsTo('child', { async: false, inverse: null }) child!: ChildModel;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    parent: ParentModel;
  }
}
