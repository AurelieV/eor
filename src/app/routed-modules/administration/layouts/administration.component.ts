import { animate, style, transition, trigger } from '@angular/animations'
import {
  AfterViewInit,
  Component,
  OnDestroy,
  TemplateRef,
  ViewChild,
} from '@angular/core'
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material'
import { HeaderService } from '@appModule/services/header.service'
import { AdministrationService, UserWithId } from '../administration.service'
import { SelectUsersComponent } from '../components/select-users.component'

enum Step {
  Settings,
  Zones,
  Staff,
}

const props = {
  [Step.Settings]: 'settings',
  [Step.Zones]: 'zones',
  [Step.Staff]: 'staff',
}

interface TournamentSettings {
  name: string
  endDate: Date
  isTeam: boolean
  software: string
}
interface TournamentData {
  settings?: TournamentSettings
  scorekeepers: UserWithId[]
  zoneLeaders: UserWithId[]
  admins: UserWithId[]
  zones: Zone[]
}

interface Zone {
  name: string
  sections: Section[]
}

interface Section {
  start: number
  end: number
}

@Component({
  selector: 'administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss'],
  animations: [
    trigger('step', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(500),
      ]),
      transition(':leave', [
        animate(500, style({ transform: 'translateX(-100%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class AdministrationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('header')
  headerTemplateRef: TemplateRef<any>

  @ViewChild('help')
  helpTemplateRef: TemplateRef<any>

  @ViewChild('scorekeepersSelecter')
  scorekeepersSelecterComp: SelectUsersComponent
  @ViewChild('zoneLeadersSelecter')
  zoneLeadersSelecterComp: SelectUsersComponent
  @ViewChild('adminsSelecter')
  adminsSelecterComp: SelectUsersComponent

  currentStep: Step = Step.Staff
  Step = Step

  private forms = new Map<Step, FormGroup>()
  zoneDisplayed: number
  helpText: string

  constructor(
    private headerService: HeaderService,
    private administration: AdministrationService,
    private dialog: MatDialog
  ) {
    this.forms.set(
      Step.Settings,
      new FormGroup({
        name: new FormControl('', [Validators.required]),
        endDate: new FormControl(null, [Validators.required]),
        isTeam: new FormControl(false),
        software: new FormControl('WLT'),
      })
    )
    this.forms.set(
      Step.Zones,
      new FormGroup({
        zones: new FormArray([]),
      })
    )
    this.forms.set(
      Step.Staff,
      new FormGroup({
        scorekeepers: new FormControl([]),
        zoneLeaders: new FormControl([]),
        admins: new FormControl([]),
      })
    )
  }

  ngAfterViewInit(): void {
    this.headerService.loadTemplate(this.headerTemplateRef)
  }

  getForm(step: Step) {
    return this.forms.get(step)
  }

  private createZone(index: number) {
    return new FormGroup({
      name: new FormControl(`Zone ${index}`, [Validators.required]),
      sections: new FormArray([this.createSection(0)]),
    })
  }

  private createSection(start: number) {
    return new FormGroup({
      start: new FormControl(start + 1, [Validators.required]),
      end: new FormControl(start + 100, [Validators.required]),
    })
  }

  addZone() {
    const form = this.forms.get(Step.Zones).get('zones') as FormArray
    form.push(this.createZone(form.length + 1))
    this.zoneDisplayed = form.length - 1
  }

  addSection(zone: FormGroup) {
    const form = zone.get('sections') as FormArray
    let start = 0
    if (form.length > 0) {
      start = form.get(String(form.length - 1)).get('end').value
    }
    form.push(this.createSection(start))
  }

  getSummary(zone: FormGroup) {
    const form = zone.get('sections') as FormArray

    return form.controls
      .map(
        (section) => section.get('start').value + '-' + section.get('end').value
      )
      .join(' / ')
  }

  deleteSection(zone: FormGroup, sectionIndex: number) {
    const form = zone.get('sections') as FormArray
    form.removeAt(sectionIndex)
  }

  deleteZone(zoneIndex) {
    const form = this.forms.get(Step.Zones).get('zones') as FormArray
    form.removeAt(zoneIndex)
  }

  displayHelp(text: string) {
    this.helpText = text
    this.dialog.open(this.helpTemplateRef)
  }

  next() {
    if (!this.forms.get(this.currentStep).valid) {
      return
    }
    if (this.currentStep === Step.Zones) {
      const form = this.forms.get(this.currentStep).get('zones') as FormArray
      const allSections = form.controls.reduce((sections, zone) => {
        return sections.concat((zone.get('sections') as FormArray).controls)
      }, [])
      //TODO: control overlap
    }
    this.currentStep++
  }

  previous() {
    this.currentStep--
  }

  create() {
    console.log('data', this.getForm(Step.Settings).value)
    console.log('data', this.getForm(Step.Zones).value)
    console.log('data', this.getForm(Step.Staff).value)
  }

  ngOnDestroy() {
    this.headerService.resetTemplate()
  }
}
