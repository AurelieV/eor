import { Location } from '@angular/common'
import { Injectable, TemplateRef } from '@angular/core'
import { MatSidenav } from '@angular/material'
import { BehaviorSubject } from 'rxjs'

@Injectable()
export class SidePanelService {
  sidePanel: MatSidenav
  _templateRef$ = new BehaviorSubject<TemplateRef<any>>(null)

  get templateRef$() {
    return this._templateRef$.asObservable()
  }

  constructor(private location: Location) {
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.beforeSidePanel) {
        this.sidePanel.close()
        history.replaceState(null, null)
      }
    })
  }

  open(template: TemplateRef<any>) {
    if (this.sidePanel) {
      this.sidePanel.open()
      history.replaceState({ beforeSidePanel: true }, null)
      history.pushState({ sidePanel: true }, null)
    }
    this._templateRef$.next(template)
  }

  close() {
    if (history.state && history.state.sidePanel) {
      history.go(-1)
    }
    this._templateRef$.next(null)
  }

  get isOpen() {
    return this.sidePanel && this.sidePanel.opened
  }
}
