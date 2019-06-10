import { Table } from '@/app/models'
import { Component, ElementRef, Input, ViewChild } from '@angular/core'
import { TableService } from '@pages/tournament/services/table.service'

@Component({
  selector: 'set-feature-panel',
  templateUrl: './set-feature.component.html',
  styleUrls: ['./set-feature.component.scss'],
})
export class SetFeaturePanelComponent {
  @Input() tables: Table[]

  @ViewChild('input') inputRef: ElementRef

  isLoading: boolean = false
  textInput: string = ''

  constructor(private tableService: TableService) {}

  set() {
    this.isLoading = true
    const tableIds = this.textInput.match(/(\d+)/g) || []
    Promise.all(tableIds.map((id) => this.tableService.updateById(id, { isFeatured: true }))).then(
      () => {
        this.isLoading = false
        this.textInput = ''
      }
    )
  }

  delete(id) {
    this.isLoading = true
    this.tableService.updateById(id, { isFeatured: false }).then(() => {
      this.isLoading = false
    })
  }
}
