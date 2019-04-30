import { Settings, StatusOrder } from '@/app/models'
import { Component } from '@angular/core'
import { SettingsService } from '@core/services/settings.service'
import { Observable } from 'rxjs'

@Component({
  selector: 'settings-panel',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsPanelComponent {
  statusOrder$: Observable<StatusOrder>
  settings$: Observable<Settings>

  constructor(private settings: SettingsService) {}

  ngOnInit() {
    this.statusOrder$ = this.settings.statusOrder$
    this.settings$ = this.settings.value$
  }
}
