import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule, MatIconModule } from '@angular/material'
import { RouterModule } from '@angular/router'
import { StatusOrderComponent } from './components/status-order/status-order.component'
import { SettingsComponent } from './settings.component'

@NgModule({
  declarations: [SettingsComponent, StatusOrderComponent],
  imports: [
    // Angular
    CommonModule,

    // Material
    MatIconModule,
    MatButtonModule,

    // App
    RouterModule.forChild([
      {
        path: '',
        component: SettingsComponent,
      },
    ]),
  ],
})
export class SettingsModule {}
