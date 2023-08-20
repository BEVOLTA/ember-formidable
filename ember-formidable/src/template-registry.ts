import type Formidable from './components/formidable';

export default interface Registry {
  Formidable: typeof Formidable;
}
