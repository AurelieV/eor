import { ZoneInfo } from '@/app/models'
import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core'

@Component({
  selector: 'zone-info',
  templateUrl: './zone-info.component.html',
  styleUrls: ['./zone-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZoneInfoComponent {
  @Input() info: ZoneInfo

  @HostBinding('class.selected')
  @Input()
  selected: boolean

  get sections() {
    return this.info.sections.map((section) => `${section.start}-${section.end}`).join(' / ')
  }
}
