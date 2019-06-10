import {
  Pipe,
  ChangeDetectorRef,
  PipeTransform,
  OnDestroy,
  NgZone,
} from '@angular/core'
import * as moment from 'moment'

@Pipe({name: 'ago', pure: false})
export class AgoPipe implements PipeTransform, OnDestroy {
  private currentTimer: number | null

  private lastTime: Number
  private lastValue: Date | moment.Moment
  private lastText: string

  constructor(private cdRef: ChangeDetectorRef, private ngZone: NgZone) {}

  transform(value: Date | moment.Moment): string {
    if (this.hasChanged(value)) {
      this.lastTime = this.getTime(value)
      this.lastValue = value
      this.removeTimer()
      this.createTimer()
      this.lastText = moment.utc(value).from(moment.utc())
    } else {
      this.createTimer()
    }

    return this.lastText
  }

  ngOnDestroy(): void {
    this.removeTimer()
  }

  private createTimer() {
    if (this.currentTimer) {
      return
    }
    const momentInstance = moment.utc(this.lastValue)

    const timeToUpdate = this.getSecondsUntilUpdate(momentInstance) * 1000
    this.currentTimer = this.ngZone.runOutsideAngular(() => {
      if (typeof window !== 'undefined') {
        return window.setTimeout(() => {
          this.lastText = moment.utc(this.lastValue).from(moment.utc())

          this.currentTimer = null
          this.ngZone.run(() => this.cdRef.markForCheck())
        }, timeToUpdate)
      }
    })
  }

  private removeTimer() {
    if (this.currentTimer) {
      window.clearTimeout(this.currentTimer)
      this.currentTimer = null
    }
  }

  private getSecondsUntilUpdate(momentInstance: moment.Moment) {
    const howOld = Math.abs(moment.utc().diff(momentInstance, 'minute'))
    if (howOld < 1) {
      return 1
    } else if (howOld < 60) {
      return 30
    } else if (howOld < 180) {
      return 300
    } else {
      return 3600
    }
  }

  private hasChanged(value: Date | moment.Moment) {
    return this.getTime(value) !== this.lastTime
  }

  private getTime(value: Date | moment.Moment) {
    if (moment.isDate(value)) {
      return value.getTime()
    } else if (moment.isMoment(value)) {
      return value.valueOf()
    } else {
      return moment.utc(value).valueOf()
    }
  }
}
