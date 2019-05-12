import { Table } from '@/app/models'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core'
import { TableService } from '@pages/tournament/services/table.service'
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs'
import { map, switchMap, take } from 'rxjs/operators'

@Component({
  selector: 'add-time-panel',
  templateUrl: './add-time.component.html',
  styleUrls: ['./add-time.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTimePanelComponent {
  @Input() table: Table
  @Output() timeAdded = new EventEmitter()
  time: number
  addOrUpdate: 'update' | 'add' = 'add'
  tableNumber: number
  currentTable$: Observable<Table | null>
  currentTableId$: BehaviorSubject<number> = new BehaviorSubject(null)
  isLoading$: Observable<boolean>

  @ViewChild('timeInput')
  timeInputRef: ElementRef

  @ViewChild('tableNumberInput')
  tableNumberInputRef: ElementRef

  constructor(private tableService: TableService) {}

  ngOnInit() {
    this.currentTable$ = this.currentTableId$.pipe(
      switchMap((id) => (id === null ? of(null) : this.tableService.getById(id)))
    )
    this.isLoading$ = combineLatest(this.currentTable$, this.currentTableId$).pipe(
      map(([table, tableId]) => {
        if (!tableId) return false
        if (!table) return true
        if (tableId !== 0 && !tableId) return true
        return table.id !== '' + tableId
      })
    )
  }

  ngAfterViewInit() {
    if (this.table) {
      this.tableNumber = Number(this.table.id)
      this.currentTableId$.next(Number(this.table.id))
      setTimeout(() => this.timeInputRef.nativeElement.focus(), 0)
    } else {
      setTimeout(() => this.tableNumberInputRef.nativeElement.focus(), 0)
    }
  }

  ngOnChanges() {
    if (this.table) {
      this.tableNumber = Number(this.table.id)
      this.currentTableId$.next(Number(this.table.id))
    }
  }

  onTableNumberChange(value) {
    this.currentTableId$.next(value)
  }

  onSubmit() {
    this.currentTable$.pipe(take(1)).subscribe((table) => {
      this.tableService.addTime(table, this.time).then(() => {
        this.timeAdded.next()
      })
    })
  }
}
