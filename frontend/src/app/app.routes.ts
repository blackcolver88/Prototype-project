import { Routes } from '@angular/router';
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
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { AdminLayoutsComponent } from './layouts/admin-layouts/admin-layouts.component';
import { FormTemplateComponent } from './pages/form-template/form-template.component';
import { ListUsersComponent } from './admin/list-users/list-users.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login-page/login-page.component').then(m => m.LoginPageComponent) },
  
  {
    path: 'admin',
    component: AdminLayoutsComponent,
    canActivate: [authGuard],
    children: [ 
      { 
        path: '', 
        component: DashboardComponent, 
        pathMatch: 'full',
        data: { title: 'Dashboard' } 
      },
      { 
        path: 'form-template', 
        component: FormTemplateComponent, 
        canActivate: [authGuard],
        data: { title: 'Form Templates' } 
      },
      { 
        path: 'editor-tree/:id', 
        component: EditorTreeComponent, 
        canActivate: [authGuard],
        data: { title: 'Form Editor' } 
      },
      { 
        path: 'list_submissions', 
        component: AdminSubmissionComponent, 
        canActivate: [authGuard],
        data: { title: 'Submissions' } 
      },
      { path: 'diagram',
         component: BpmnModelerComponent, 
         canActivate: [authGuard],
         data: { title: 'Camunda Modeler' } 
        },
      { path: 'processes',
         component: ProcessesPageComponent,
         canActivate: [authGuard],
         data: { title: 'Processes' } 
        },
      { path: 'register',
         component: RegisterComponent,
         canActivate: [authGuard],
         data: { title: 'Register' } 
        },
        { path: 'users',
         component: ListUsersComponent,
         canActivate: [authGuard],
         data: { title: 'List users' } 
        },

    ] 
  }, 
   

  { path: 'editor-tree/:id', component: EditorTreeComponent, canActivate: [authGuard] },
  { path: 'forms', component: FormsComponent, canActivate: [authGuard] },
  { path: 'formvalue/:id', component: FormvalueComponent, canActivate: [authGuard] },
  { path: 'responses/:userId/:formId', component: FormResponsesComponent, canActivate: [authGuard] },
  { path: 'list', component: FormListComponent, canActivate: [authGuard] },
  { path: 'edit/:userId/:submissionId', component: EditFormComponent, canActivate: [authGuard] },
  // { path: 'list_submissions', component: AdminSubmissionComponent, canActivate: [authGuard] },
  // { path: 'diagram', component: BpmnModelerComponent, canActivate: [authGuard] },
  // { path: 'processes', component: ProcessesPageComponent, canActivate: [authGuard] },
  // { path: 'register', component: RegisterComponent, canActivate: [authGuard] },
  

  { path: '**', redirectTo: 'login' }
];