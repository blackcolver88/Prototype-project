import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {FormTemplateComponent} from './form-template.component';


const routes: Routes = [
  {
    path: '',
    component: FormTemplateComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormTemplateRoutingModule { }
