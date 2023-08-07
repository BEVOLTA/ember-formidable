import Formidable from './components/formidable';
import FormidableService from './services/formidable';

export default interface Registry {
  // -- COMPONENTS
  Formidable: typeof Formidable;

  // -- SERVICES
  FormidableService: typeof FormidableService;
}
