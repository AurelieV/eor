import { Action } from '@/app/models'
import { Component, Input } from '@angular/core'

@Component({
  selector: 'actions-panel',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
})
export class ActionsPanelComponent {
  @Input() actions: Action[]
}
