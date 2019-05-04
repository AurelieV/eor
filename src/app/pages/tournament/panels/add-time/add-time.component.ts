import { Table } from '@/app/models'
import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core'

@Component({
  selector: 'add-time-panel',
  templateUrl: './add-time.component.html',
  styleUrls: ['./add-time.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTimePanelComponent {
  @Input() table: Table
  time: number
  tableNumber: number

  @ViewChild('timeInput')
  timeInputRef: ElementRef

  @ViewChild('tableNumberInput')
  tableNumberInputRef: ElementRef

  ngAfterViewInit() {
    if (this.table) {
      this.tableNumber = Number(this.table.id)
      setTimeout(() => this.timeInputRef.nativeElement.focus(), 0)
    } else {
      setTimeout(() => this.tableNumberInputRef.nativeElement.focus(), 0)
    }
  }

  ngOnChanges() {
    if (this.table) {
      this.tableNumber = Number(this.table.id)
    }
  }

  onSubmit() {}
}
