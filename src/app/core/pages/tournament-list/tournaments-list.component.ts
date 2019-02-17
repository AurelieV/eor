import { Component } from '@angular/core'

@Component({
  selector: 'tournaments-list',
  template: `
    <a mat-raised-button [routerLink]="['/administration']">Add</a>
  `,
})
export class TournamentsListComponent {}
