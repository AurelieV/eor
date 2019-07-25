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
import { NotificationService } from '@core/services/notification.service'
import { TableService } from '@pages/tournament/services/table.service'
import { SelectUserComponent } from '@shared/custom-form/select-user/select-user.component'
import * as moment from 'moment'
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs'
import { map, switchMap, take } from 'rxjs/operators'

@Component({
  selector: 'assign-judge-panel',
  templateUrl: './assign-judge.component.html',
  styleUrls: ['./assign-judge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignJudgePanelComponent {
  @Input() table: Table
  @Output() judgeAssignated = new EventEmitter()
  tableNumber: number
  currentTable$: Observable<Table | null>
  currentTableId$: BehaviorSubject<number> = new BehaviorSubject(null)
  isLoading$: Observable<boolean>
  judge: string

  @ViewChild('tableNumberInput')
  tableNumberInputRef: ElementRef

  @ViewChild(SelectUserComponent)
  selectUserComponent: SelectUserComponent

  constructor(
    private tableService: TableService,
    private notificationService: NotificationService
  ) {}

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

  submit() {
    this.currentTable$.pipe(take(1)).subscribe((table) => {
      this.tableService
        .update(table, {
          assignated: this.judge,
          status: 'covered',
          updateStatusTime: moment.utc().valueOf(),
        })
        .then(() => {
          this.notificationService.notify(`${this.judge} assignated to Table ${table.id}`)
          this.judgeAssignated.next()
        })
    })
  }
}
