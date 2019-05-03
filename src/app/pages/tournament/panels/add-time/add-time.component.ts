import { Table } from '@/app/models'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

@Component({
  selector: 'add-time-panel',
  templateUrl: './add-time.component.html',
  styleUrls: ['./add-time.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTimePanelComponent {
  @Input() table: Table
}
