import { Tournament } from '@/app/models'
import { Component, OnInit } from '@angular/core'
import { AuthenticationService } from '@core/services/authentication.service'
import { TournamentService } from '@core/services/tournament.service'
import { Observable } from 'rxjs'

@Component({
  selector: 'tournaments-list',
  templateUrl: './tournaments-list.component.html',
  styleUrls: ['./tournaments-list.component.scss'],
})
export class TournamentsListComponent implements OnInit {
  tournaments$: Observable<Tournament[]>
  canCreateTournament$: Observable<boolean>

  constructor(private tournaments: TournamentService, private authent: AuthenticationService) {}

  ngOnInit() {
    this.tournaments$ = this.tournaments.getAll()
    this.canCreateTournament$ = this.authent.hasRole('tournament-creation')
  }
}
