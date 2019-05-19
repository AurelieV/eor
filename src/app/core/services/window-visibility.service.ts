import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable()
export class WindowVisibility {
  value$ = new BehaviorSubject<boolean>(true)

  constructor() {
    let hidden, visibilityChange
    if (typeof document.hidden !== 'undefined') {
      // Opera 12.10 and Firefox 18 and later support
      hidden = 'hidden'
      visibilityChange = 'visibilitychange'
    } else if (typeof (document as any).msHidden !== 'undefined') {
      hidden = 'msHidden'
      visibilityChange = 'msvisibilitychange'
    } else if (typeof (document as any).webkitHidden !== 'undefined') {
      hidden = 'webkitHidden'
      visibilityChange = 'webkitvisibilitychange'
    }
    document.addEventListener(
      visibilityChange,
      () => {
        this.value$.next(!document[hidden])
      },
      false
    )
  }
}
