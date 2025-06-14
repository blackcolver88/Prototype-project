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
import { authGuard } from './core/auth/guards/authGuard';
import { adminGuard, adminOnlyGuard, userGuard, formAccessGuard, requestManagementGuard } from './core/auth/guards/roleGuard';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { AdminLayoutsComponent } from './layouts/admin-layouts/admin-layouts.component';
import { FormTemplateComponent } from './pages/form-template/form-template.component';
import { ListUsersComponent } from './admin/list-users/list-users.component';
import { UserLayoutsComponent } from './layouts/user-layouts/user-layouts.component';
import { ProfilComponent } from './user/pages/profil/profil.component';
import { RoleModalComponent } from './admin/role-modal/role-modal.component';
import { RoleTableComponent } from './admin/role-table.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login-page/login-page.component').then(m => m.LoginPageComponent) },

  {
    path: 'admin',
    component: AdminLayoutsComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
        pathMatch: 'full',
        canActivate: [adminOnlyGuard],
        data: { title: 'Dashboard', adminOnly: true }
      },
      {
        path: 'form-template',
        component: FormTemplateComponent,
        data: { title: 'Form Templates' }
      },
      {
        path: 'request-management',
        loadComponent: () => import('./pages/request-management/request-management.component').then(m => m.RequestManagementComponent),
        canActivate: [requestManagementGuard],
        data: { title: 'Request Management' }
      },
      {
        path: 'editor-tree/:id',
        component: EditorTreeComponent,
        data: { title: 'Form Editor' }
      },
      {
        path: 'list_submissions',
        component: AdminSubmissionComponent,
        canActivate: [adminOnlyGuard],
        data: { title: 'Submissions', adminOnly: true }
      },
      { path: 'diagram',
         component: BpmnModelerComponent,
         data: { title: 'Camunda Modeler' }
        },
      { path: 'processes',
         component: ProcessesPageComponent,
         data: { title: 'Processes' }
        },
      { path: 'users',
         component: ListUsersComponent,
         canActivate: [adminOnlyGuard],
         data: { title: 'List users', adminOnly: true }
        },
      { path: 'role',
         component: RoleModalComponent,
         canActivate: [adminOnlyGuard],
         data: { title: 'Roles', adminOnly: true }
        },
      { path: 'role-table',
         component: RoleTableComponent,
         canActivate: [adminOnlyGuard],
         data: { title: 'Roles', adminOnly: true }
        },
    ]
  },

  {
    path: 'user',
    component: UserLayoutsComponent,
    canActivate: [userGuard],
    children: [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      },
      {
        path: 'profile',
        component: ProfilComponent,
        data: { title: 'Profile' }
      },
      {
        path: 'requests',
        loadComponent: () => import('./user/pages/requests/requests.component').then(m => m.RequestsComponent),
        canActivate: [formAccessGuard],
        data: { title: 'Requests' }
      },
      {
        path: 'list',
        component: FormListComponent,
        canActivate: [formAccessGuard],
        data: { title: 'Responses' }
      }
    ]
  },

  { path: 'editor-tree/:id', component: EditorTreeComponent, canActivate: [adminGuard] },
  { path: 'forms', component: FormsComponent, canActivate: [formAccessGuard] },
  { path: 'formvalue/:id', component: FormvalueComponent, canActivate: [formAccessGuard] },
  { path: 'responses/:userId/:formId', component: FormResponsesComponent, canActivate: [formAccessGuard] },
  { path: 'list', component: FormListComponent, canActivate: [formAccessGuard] },
  { path: 'edit/:userId/:submissionId', component: EditFormComponent, canActivate: [formAccessGuard] },

  // { path: 'list_submissions', component: AdminSubmissionComponent, canActivate: [authGuard] },
  // { path: 'diagram', component: BpmnModelerComponent, canActivate: [authGuard] },
  // { path: 'processes', component: ProcessesPageComponent, canActivate: [authGuard] },
  // { path: 'register', component: RegisterComponent, canActivate: [authGuard] },


  { path: '**', redirectTo: 'login' }
];