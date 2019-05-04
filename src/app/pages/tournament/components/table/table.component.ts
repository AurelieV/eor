import { Table } from '@/app/models'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
} from '@angular/core'
import { TableService } from '@pages/tournament/services/table.service'

@Component({
  selector: 'table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  @Input() table: Table
  @Input() canInteractWithFeaturedTables: boolean = true
  @Output() openTable = new EventEmitter()

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
    this.openTable.emit()
  }
}
