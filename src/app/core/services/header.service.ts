import { TemplateRef } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

export class HeaderService {
  private _templateRef$ = new BehaviorSubject<TemplateRef<any>>(null)
  private _menuTemplateRef$ = new BehaviorSubject<TemplateRef<any>>(null)

  get templateRef$() {
    return this._templateRef$.asObservable()
  }

  get menuTemplateRef$() {
    return this._menuTemplateRef$.asObservable()
  }

  loadTemplate(templateRef: TemplateRef<any>) {
    this._templateRef$.next(templateRef)
  }

  loadMenuTemplate(templateRef: TemplateRef<any>) {
    this._menuTemplateRef$.next(templateRef)
  }

  resetTemplate() {
    this._templateRef$.next(null)
  }

  resetMenuTemplate() {
    this._menuTemplateRef$.next(null)
  }

  resetAll() {
    this.resetMenuTemplate()
    this.resetMenuTemplate()
  }
}
