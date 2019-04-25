import { Component, EventEmitter, Output } from '@angular/core'
import { TournamentStore } from '@pages/tournament/services/tournament-store.service'
import * as moment from 'moment'

@Component({
  selector: 'clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss'],
})
export class ClockComponent {
  @Output()
  clockSet = new EventEmitter()
  clockMinutes: number = 50
  clockSeconds: number = 0

  constructor(private store: TournamentStore) {}

  onSubmit() {
    const now = moment.utc()
    this.store.setClock(
      now
        .add(this.clockMinutes, 'minutes')
        .add(this.clockSeconds, 'seconds')
        .valueOf()
    )
    this.clockSet.emit()
  }

  onReset() {
    this.store.setClock(null)
    this.clockSet.emit()
  }
}
