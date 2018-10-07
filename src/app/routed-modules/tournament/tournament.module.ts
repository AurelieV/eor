import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatSidenavModule } from '@angular/material'
import { RouterModule } from '@angular/router'
import { TournamentComponent } from './layouts/tournament.component'

@NgModule({
  declarations: [TournamentComponent],
  providers: [],
  imports: [
    // Angular
    CommonModule,

    // Material
    MatSidenavModule,

    // App
    RouterModule.forChild([
      {
        path: '',
        component: TournamentComponent,
      },
    ]),
  ],
})
export class TournamentModule {}
