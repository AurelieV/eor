import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatExpansionModule,
  MatIconModule,
  MatInputModule,
  MatNativeDateModule,
  MatSelectModule,
} from '@angular/material'
import { RouterModule } from '@angular/router'
import { AdministrationComponent } from './layouts/administration.component'

@NgModule({
  declarations: [AdministrationComponent],
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // Material
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,

    // App
    RouterModule.forChild([
      {
        path: '',
        component: AdministrationComponent,
      },
    ]),
  ],
})
export class AdministrationModule {}
