import { Table } from '@/app/models'
import { Component, HostBinding, HostListener, Input } from '@angular/core'
import { TableService } from '@pages/tournament/services/table.service'

@Component({
  selector: 'table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent {
  @Input() table: Table
  @Input() canInteractWithFeaturedTables: boolean = true

  @HostBinding('class')
  get status() {
    return `block ${this.table && this.table.status}`
  }

  constructor(private tableService: TableService) {}

  @HostListener('tap')
  mainAction() {
    this.tableService.changeStatus(this.table)
  }

  @HostListener('press')
  secondaryAction() {
    console.log('secondary')
  }
}
