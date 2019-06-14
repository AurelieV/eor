import { TournamentStaff } from '@/app/models'
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { MatDialog } from '@angular/material'
import { NotificationService } from '@core/services/notification.service'
import { TournamentStore } from '@pages/tournament/services/tournament-store.service'

@Component({
  selector: 'change-roles-panel',
  templateUrl: './change-roles.component.html',
  styleUrls: ['./change-roles.component.scss'],
})
export class ChangeRolesPanelComponent {
  @Input() staff: TournamentStaff
  @Input() displayOnlyFloor: boolean
  @Output() rolesChanged = new EventEmitter()

  @ViewChild('help') helpTemplateRef: TemplateRef<any>

  helpText: string

  form = new FormGroup({
    scorekeepers: new FormControl([]),
    zoneLeaders: new FormControl([]),
    admins: new FormControl([]),
    floorJudges: new FormControl([]),
    tmpFloorJudges: new FormControl([]),
  })

  constructor(
    private dialog: MatDialog,
    private store: TournamentStore,
    private notifier: NotificationService
  ) {}

  displayHelp(text: string) {
    this.helpText = text
    this.dialog.open(this.helpTemplateRef)
  }

  onSubmit() {
    this.store.setStaff(this.form.getRawValue()).then(() => {
      this.notifier.notify('Staff updated')
      this.rolesChanged.emit()
    })
  }

  ngOnChanges() {
    if (this.staff) {
      this.form.setValue({
        admins: [],
        scorekeepers: [],
        zoneLeaders: [],
        floorJudges: [],
        tmpFloorJudges: [],
        ...this.staff,
      })
    }
  }
}
