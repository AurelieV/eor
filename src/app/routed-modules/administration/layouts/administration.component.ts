import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { HeaderService } from '@appModule/services/header.service';

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
  headerTemplateRef

  currentStep: Step = Step.Staff
  Step = Step

  data: TournamentData = {}
  private forms = new Map<Step, FormGroup>()
  zoneDisplayed: number

  constructor(private headerService: HeaderService) {
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

    return form.controls.map(section => section.get('start').value + '-' + section.get('end').value).join(' / ')
   }

  deleteSection(zone: FormGroup, sectionIndex: number) {
    const form = zone.get('sections') as FormArray
    form.removeAt(sectionIndex)
  }

  deleteZone(zoneIndex) {
    const form = this.forms.get(Step.Zones).get('zones') as FormArray
    form.removeAt(zoneIndex)
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

  ngOnDestroy() {
    this.headerService.resetTemplate()
  }
}
