import { MediaMatcher } from '@angular/cdk/layout'
import { Inject, Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { MOBILE_MEDIA_QUERY } from 'src/app/tokens'

@Injectable()
export class NotificationService {
  constructor(
    private snackBar: MatSnackBar,
    private media: MediaMatcher,
    @Inject(MOBILE_MEDIA_QUERY) private mobileQuery: string
  ) {}

  notify(message: string, duration: number = 5000) {
    const verticalPosition = this.media.matchMedia(this.mobileQuery).matches
      ? 'bottom'
      : 'top'
    this.snackBar.open(message, 'Dismiss', {
      duration,
      verticalPosition,
    })
  }
}
