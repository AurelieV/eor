import { Action } from '@/app/models'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

@Component({
  selector: 'actions-panel',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionsPanelComponent {
  @Input() actions: Action[]

  get groupActions() {
    if (!this.actions) {
      return {
        scorekeeper: [],
        all: [],
        teamlead: [],
        zonelead: [],
      }
    }
    return {
      scorekeeper: this.actions.filter(({ role }) => role === 'scorekeeper'),
      all: this.actions.filter(({ role }) => role === 'all'),
      teamlead: this.actions.filter(({ role }) => role === 'teamlead'),
      zonelead: this.actions.filter(({ role }) => role === 'zonelead'),
    }
  }

  do(key: string) {}
}
