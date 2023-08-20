import Model, { attr } from 'ember-data/model';

export default class ChildModel extends Model {
  @attr('string') str!: string;
  @attr('boolean') bool!: boolean;
  @attr('number') num!: number;
  @attr('date') date!: Date;
  @attr({ defaultValue: () => ({}) }) obj!: object;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    child: ChildModel;
  }
}
