import { Component, OnInit } from '@angular/core';
import { FormSubmissionService } from '../../../services/form-submission.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-form-list',
  imports: [CommonModule],
  templateUrl: './form-list.component.html',
  styleUrl: './form-list.component.css'
})
export class FormListComponent implements OnInit {
  forms: any[] = [];
  userId/*: number*/ = 1;  

  constructor(private formSubmissionService: FormSubmissionService,private router: Router,) {}
  ngOnInit() {
    
    this.formSubmissionService.getUserFormSubmissions(this.userId).subscribe(
      (data) => {
       
        this.forms = data.map((submission: any) => ({
          id: submission.id,
          task: submission.task || 'Tâche inconnue', 
          formTitle: submission.formTitle || 'Formulaire inconnu', 
          date: submission.date || 'Date inconnue' 
        }));
      },
      (error) => {
        console.error('Erreur lors de la récupération des formulaires :', error);
      }
    );
  }

  showFormResponses(formId: number) {
    this.router.navigate(['/responses', this.userId, formId]);
    
  }
}