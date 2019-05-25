import { Result } from '@/app/models'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core'
import { NotificationService } from '@core/services/notification.service'
import { INVALID_ID, TableService } from '@pages/tournament/services/table.service'
import * as moment from 'moment'

@Component({
  selector: 'import-results-panel',
  templateUrl: './import-results.component.html',
  styleUrls: ['./import-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportResultsPanelComponent {
  @Output() resultsImported = new EventEmitter()
  textInput: string
  errorMessage: string = null
  isLoading: boolean = false

  @ViewChild('input')
  inputRef: ElementRef

  constructor(
    private tableService: TableService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    setTimeout(() => this.inputRef.nativeElement.focus(), 0)
  }

  import() {
    this.errorMessage = null
    this.isLoading = true
    let [header, ...body] = this.textInput.split('\n')
    body = body.filter((line) => !!line)
    header = header.replace('Team', 'Player')
    const mandatoryHeaders = ['Table', 'Player', 'Result', 'Opponent']
    if (mandatoryHeaders.findIndex((h) => !header.includes(h)) !== -1) {
      this.errorMessage = 'Your headers seem wrong. Have you done the right import?'
      this.isLoading = false
      return
    }
    const format = [header, ...body].join('\n')
    const tables = window['Papa']
      .parse(format, {
        header: true,
      })
      .data.map((table) => {
        const result = table['Result']
        if (!result || result === 'pending' || result === 'BYE') {
          return null
        }
        const [type, scores] = result.split(' ')
        let score1: number, score2: number, draw: number
        if (type === 'Draw') {
          score1 = score2 = draw = 1
        } else if (scores) {
          ;[score1, score2] = scores.split('-').map(Number)
        } else {
          return null
        }
        if (isNaN(score1) || isNaN(score2)) {
          return null
        }
        const output: { tableId: string; result: Result } = {
          tableId: table['Table'],
          result: {
            player1: {
              score: score1,
              drop: false,
            },
            player2: {
              score: score2,
              drop: false,
            },
            draw: draw || 0,
          },
        }
        return output
      })
      .filter((t) => t && !isNaN(Number(t.tableId)))

    let successFullImport = 0
    let invalidTableIds = []
    let errorTables = []

    const requests = tables.map(({ tableId, result }) =>
      this.tableService
        .updateById(tableId, {
          result,
          status: 'done',
          stageHasPaper: true,
          updateStatusTime: moment.utc().valueOf(),
        })
        .then(() => {
          successFullImport = successFullImport + 1
        })
        .catch((e) => {
          if (e === INVALID_ID) {
            invalidTableIds.push(tableId)
          } else {
            errorTables.push(tableId)
          }
        })
    )

    Promise.all(requests).then(() => {
      this.isLoading = false
      if (successFullImport === tables.length) {
        this.notificationService.notify(`${successFullImport} results imported successfully`)
        this.resultsImported.emit()
      } else {
        this.errorMessage = `
        Try to import ${tables.length} results. <br>
        ${errorTables.length + invalidTableIds.length} were not updated (${
          invalidTableIds.length
        } tables with non existing number) <br>
        ${errorTables.join(', ') || 'None '} were invalid <br>
        ${invalidTableIds.join(', ') || 'None '} do no exist
        `
      }
      this.cdr.detectChanges()
    })
  }
}
