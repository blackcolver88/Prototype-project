import { Route } from '@angular/router';
import { EditorTreeComponent } from "./pages/editor-tree/editor-tree.component";
import { FormsComponent } from './user/pages/forms/forms.component';
import { FormvalueComponent } from './user/pages/formvalue/formvalue.component';
import { FormResponsesComponent } from './user/pages/form-responses/form-responses.component';
import { FormListComponent } from './user/pages/form-list/form-list.component';
import { EditFormComponent } from './user/pages/edit-form/edit-form.component';
import { AdminSubmissionComponent } from './pages/admin-submission/admin-submission.component';
import { BpmnModelerComponent } from './camunda/bpmn-modeler/bpmn-modeler.component';
import { ProcessesPageComponent } from './pages/processes/processes-page/processes-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { authGuard } from './core/auth/guards/authGuard';
import { RegisterComponent } from './user/pages/register/register.component';

export const routes: Route[] = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login-page/login-page.component').then(m => m.LoginPageComponent) },
  { 
    path: 'form-template', 
    loadChildren:() => import('./pages/form-template/form-template.module').then((m) => m.FormTemplateModule),
    canActivate: [authGuard] 
  },
  { path: 'editor-tree/:id', component: EditorTreeComponent, canActivate: [authGuard] },
  { path: 'forms', component: FormsComponent, canActivate: [authGuard] },
  { path: 'formvalue/:id', component: FormvalueComponent, canActivate: [authGuard] },
  { path: 'responses/:userId/:formId', component: FormResponsesComponent, canActivate: [authGuard] },
  { path: 'list', component: FormListComponent, canActivate: [authGuard] },
  { path: 'edit/:userId/:submissionId', component: EditFormComponent, canActivate: [authGuard] },
  { path: 'list_submissions', component: AdminSubmissionComponent, canActivate: [authGuard] },
  { path: 'diagram', component: BpmnModelerComponent, canActivate: [authGuard] },
  { path: 'processes', component: ProcessesPageComponent, canActivate: [authGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [authGuard] }
];