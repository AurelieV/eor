import { Table, ViewMode } from '@/app/models'
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
  @Input() viewMode: ViewMode
  @Input() isOutstandings: boolean
  @Input() displayFeatured: boolean = false
  @Output() openTable = new EventEmitter()

  @HostBinding('class')
  get status() {
    let status = `block ${this.viewMode}`
    if (this.table) {
      if (this.displayFeatured || !this.table.isFeatured) {
        status += ` ${this.table.status}`
      } else {
        status += ` featured`
      }
    }
    return status
  }

  constructor(private tableService: TableService) {}

  @HostListener('tap', ['$event.target.tagName'])
  mainAction(tag) {
    if (this.displayFeatured || !this.table.isFeatured) {
      if (this.viewMode === 'large') {
        if (tag === 'MAT-ICON' || tag === 'BUTTON') {
          return
        }
        this.openTable.emit()
      } else {
        this.tableService.changeStatus(this.table)
      }
    }
  }

  @HostListener('press')
  secondaryAction() {
    if (this.displayFeatured || !this.table.isFeatured) {
      this.openTable.emit()
    }
  }

  receivedPaper(e: MouseEvent) {
    this.tableService.update(this.table, { stageHasPaper: true })
  }
}
