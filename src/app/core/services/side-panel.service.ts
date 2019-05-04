import { Injectable, TemplateRef } from '@angular/core'
import { MatSidenav } from '@angular/material'
import { BehaviorSubject } from 'rxjs'

@Injectable()
export class SidePanelService {
  sidePanel: MatSidenav
  _templateRef$ = new BehaviorSubject<TemplateRef<any>>(null)
  _backTemplateRef$ = new BehaviorSubject<TemplateRef<any>>(null)
  _onClose$ = new BehaviorSubject<void>(null)

  get templateRef$() {
    return this._templateRef$.asObservable()
  }

  get backTemplateRef$() {
    return this._backTemplateRef$.asObservable()
  }

  get onClose$() {
    return this._onClose$.asObservable()
  }

  constructor() {
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.beforeSidePanel) {
        this.sidePanel.close()
        history.replaceState(null, null)
      }
    })
  }

  open(template: TemplateRef<any>, backTemplate: TemplateRef<any> = null) {
    if (this.sidePanel) {
      this.sidePanel.open()
      history.replaceState({ beforeSidePanel: true }, null)
      history.pushState({ sidePanel: true }, null)
    }
    this._templateRef$.next(template)
    this._backTemplateRef$.next(backTemplate)
  }

  close() {
    if (history.state && history.state.sidePanel) {
      history.go(-1)
    }
    this._templateRef$.next(null)
    this._onClose$.next(null)
  }

  back() {
    const backTemplate = this._backTemplateRef$.getValue()
    if (!backTemplate) {
      this.close()
    } else {
      this._templateRef$.next(backTemplate)
      this._backTemplateRef$.next(null)
    }
  }

  get isOpen() {
    return this.sidePanel && this.sidePanel.opened
  }
}
