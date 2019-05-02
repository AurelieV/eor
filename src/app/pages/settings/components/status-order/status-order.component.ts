import { Settings, StatusOrder } from '@/app/models'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { SettingsService } from '@core/services/settings.service'

@Component({
  selector: 'status-order',
  templateUrl: './status-order.component.html',
  styleUrls: ['./status-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusOrderComponent {
  @Input() statusOrder: StatusOrder
  @Input() settings: Settings

  get displayedStatus() {
    if (!this.statusOrder) return []
    let val = [...this.statusOrder, this.statusOrder[0]]
    if (val[0] !== 'unknown') {
      val = ['unknown', ...val]
    }

    return val
  }

  constructor(private settingsService: SettingsService) {}

  toggleIsGreenFirst() {
    this.settingsService.updateStatusOrder({
      isGreenFirst: !this.settings.statusOrder.isGreenFirst,
      isUnknownHidden: this.settings.statusOrder.isUnknownHidden,
    })
  }
  toggleIsUnknownHidden() {
    this.settingsService.updateStatusOrder({
      isGreenFirst: this.settings.statusOrder.isGreenFirst,
      isUnknownHidden: !this.settings.statusOrder.isUnknownHidden,
    })
  }
}
