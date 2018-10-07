import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { AdministrationComponent } from './layouts/administration.component'

@NgModule({
  declarations: [AdministrationComponent],
  imports: [
    // Angular
    CommonModule,

    // Material

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
