import Formidable from './components/formidable';
import { yupResolver } from './resolvers/yup';

export default interface Registry {
  // -- COMPONENTS
  Formidable: typeof Formidable;

  // -- RESOLVERS
  yupResolver: typeof yupResolver;
}
