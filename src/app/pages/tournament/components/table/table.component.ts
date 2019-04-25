import { Table } from '@/app/models'
import { Component, HostBinding, Input } from '@angular/core'

@Component({
  selector: 'table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent {
  @Input() table: Table

  @HostBinding('class')
  get status() {
    return `block ${'playing' || (this.table && this.table.status)}`
  }
}
