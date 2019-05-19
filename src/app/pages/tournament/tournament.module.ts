import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule, MatIconModule, MatSidenavModule } from '@angular/material'
import { RouterModule } from '@angular/router'
import { HeaderComponent } from './components/header/header.component'
import { TableComponent } from './components/table/table.component'
import { TournamentStore } from './services/tournament-store.service'
import { TournamentComponent } from './tournament.component'

@NgModule({
  declarations: [TournamentComponent, TableComponent, HeaderComponent],
  imports: [
    // Angular
    CommonModule,

    // Material
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,

    // App
    RouterModule.forChild([
      {
        path: '',
        component: TournamentComponent,
      },
    ]),
  ],
  providers: [TournamentStore],
})
export class TournamentModule {}
