import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import {
  MatButtonModule,
  MatInputModule,
  MatProgressSpinnerModule,
} from '@angular/material'
import { CustomSubmitButton } from './submit-button.component'

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  declarations: [CustomSubmitButton],
  exports: [CustomSubmitButton],
})
export class CustomFormModule {}
