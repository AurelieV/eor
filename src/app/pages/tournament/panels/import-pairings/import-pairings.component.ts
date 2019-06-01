import { Software } from '@/app/interfaces';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ErrorService } from '@core/services/error.service';
import { NotificationService } from '@core/services/notification.service';
import { INVALID_ID, TableService } from '@pages/tournament/services/table.service';

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
  @Input() software: string

  Software = Software

  @ViewChild('input')
  inputRef: ElementRef

  constructor(
    private tableService: TableService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private errorService: ErrorService
  ) {}

  ngAfterViewInit() {
    setTimeout(() => this.inputRef.nativeElement.focus(), 0)
  }

  private extractFromWLTR() {
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

    return tables
  }

  private extractFromWER() {
    let [header, ...body] = this.textInput
      .split('\n')
      .filter(
        (line) =>
          !line.startsWith('---') &&
          !line.startsWith('Wizard') &&
          !line.startsWith('Event') &&
          !line.startsWith('Round') &&
          !line.startsWith('Report') &&
          !!line
      )
    const mandatoryHeaders = ['Table', 'Player', 'Opponent', 'Points']
    if (mandatoryHeaders.findIndex((h) => !header.includes(h)) !== -1) {
      this.errorMessage = 'Your headers seem wrong. Have you done the right import?'
      this.isLoading = false
      return
    }
    try {
      const format = [header, ...body].join('\n').replace(/ {2,}/g, ';')
      const tables = window['Papa']
        .parse(format, {
          header: true,
        })
        .data.map((table) => {
          if (table['Opponent'] === '***Bye***') {
            return
          }
          const [player1Score, player2Score] = table['Points-'].split('-').map((s) => Number(s))
          return {
            tableId: table['Table'],
            player1: {
              name: table['Player'],
              currentPoints: isNaN(player1Score) ? 0 : player1Score,
            },
            player2: {
              name: table['Opponent'],
              currentPoints: isNaN(player2Score) ? 0 : player2Score,
            },
          }
        })
        .filter((t) => t && !isNaN(Number(t.tableId)))

      return tables
    } catch (e) {
      this.errorService.raise(e)
      this.errorMessage = 'Import failed'
      return []
    }
  }

  import() {
    this.errorMessage = null
    this.isLoading = true

    let tables
    if (this.software === Software.WER) {
      tables = this.extractFromWER()
    } else if (this.software === Software.WLTR) {
      tables = this.extractFromWLTR()
    }

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
