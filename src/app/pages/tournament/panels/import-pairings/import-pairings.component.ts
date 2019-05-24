import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
} from '@angular/core'
import { NotificationService } from '@core/services/notification.service'
import { INVALID_ID, TableService } from '@pages/tournament/services/table.service'

@Component({
  selector: 'import-pairings-panel',
  templateUrl: './import-pairings.component.html',
  styleUrls: ['./import-pairings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportPairingsPanelComponent {
  textInput: string
  errorMessage: string = null
  isLoading: boolean = false
  @Output() pairingsImported = new EventEmitter()

  constructor(
    private tableService: TableService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  import() {
    this.errorMessage = null
    this.isLoading = true
    let [header, ...body] = this.textInput.split('\n')
    body = body.filter((line) => !!line)
    header = header.replace('Team 1', 'Player 1')
    header = header.replace('Team 2', 'Player 2')
    header = header.replace(/Points/, 'player1Score')
    header = header.replace(/Points/, 'player2Score')
    const mandatoryHeaders = ['Player 1', 'Player 2', 'player1Score', 'player2Score', 'Table']
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
        return {
          tableId: table['Table'],
          player1: {
            name: table['Player 1'],
            currentPoints: table.player1Score === 'undefined' ? 0 : Number(table.player1Score),
          },
          player2: {
            name: table['Player 2'],
            currentPoints: table.player2Score === 'undefined' ? 0 : Number(table.player2Score),
          },
        }
      })
      .filter((t) => !isNaN(Number(t.tableId)))
    let successFullImport = 0
    let invalidTableIds = []
    let errorTables = []
    const requests = tables.map(({ tableId, player1, player2 }) =>
      this.tableService
        .updateById(tableId, { player1, player2 })
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
        this.notificationService.notify(`${successFullImport} tables imported successfully`)
        this.pairingsImported.emit()
      } else {
        this.errorMessage = `
        Try to import ${tables.length} tables. <br>
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
