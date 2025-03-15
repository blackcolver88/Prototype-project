import {Route} from '@angular/router';
import {EditorTreeComponent} from "./pages/editor-tree/editor-tree.component";
import { FormsComponent } from './user/pages/forms/forms.component';
import { FormvalueComponent } from './user/pages/formvalue/formvalue.component';

export const routes: Route[] = [
  { path: '', redirectTo: '/form-template', pathMatch: 'full' },
  { path: 'form-template', loadChildren:() => import('./pages/form-template/form-template.module').then((m) => m.FormTemplateModule) },
  { path: 'editor-tree/:id', component: EditorTreeComponent },
  { path: 'forms', component: FormsComponent },
  { path: 'formvalue/:id', component: FormvalueComponent },


];
