import { TemplateRef } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

export class HeaderService {
  private _templateRef$ = new BehaviorSubject<TemplateRef<any>>(null)

  get templateRef$() {
    return this._templateRef$.asObservable()
  }

  loadTemplate(templateRef: TemplateRef<any>) {
    this._templateRef$.next(templateRef)
  }

  resetTemplate() {
    this._templateRef$.next(null)
  }
}
