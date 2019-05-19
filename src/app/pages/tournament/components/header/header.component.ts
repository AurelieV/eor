import { Tournament } from '@/app/models'
import { Component, Input } from '@angular/core'
import { TournamentStore } from '@pages/tournament/services/tournament-store.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
  selector: 'tournament-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() tournament: Tournament
  clock$: Observable<string>

  constructor(private store: TournamentStore) {}

  ngOnInit() {
    this.clock$ = this.store.clock$.pipe(
      map((duration) => {
        const negative = duration.asMinutes() < 0
        const minutes = Math.abs(duration.minutes())
        const seconds = Math.abs(duration.seconds())
        return `${negative ? '-' : ''}${minutes < 10 ? '0' : ''}${minutes}:${
          seconds < 10 ? '0' : ''
        }${seconds}`
      })
    )
  }
}
