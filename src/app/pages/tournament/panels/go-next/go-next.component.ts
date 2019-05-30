import { Component, EventEmitter, Output } from '@angular/core';
import { NotificationService } from '@core/services/notification.service';
import { TournamentStore } from '@pages/tournament/services/tournament-store.service';

@Component({
  selector: 'go-next-panel',
  templateUrl: './go-next.component.html',
  styleUrls: ['./go-next.component.scss'],
})
export class GoNextPanelComponent {
  @Output() goNext = new EventEmitter()

  constructor(private store: TournamentStore, private notifier: NotificationService) {}

  go() {
    this.store.restart().then(() => {
      this.notifier.notify('Round reset')
      this.goNext.emit()
    })
  }
}
