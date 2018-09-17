import { MediaMatcher } from '@angular/cdk/layout'
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  ViewChild,
} from '@angular/core'
import { MatSidenav } from '@angular/material'
import { MOBILE_MEDIA_QUERY } from './tokens'

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnDestroy {
  mobileQuery: MediaQueryList
  private _mobileQueryListener: () => void

  private isSidenavOpen: boolean

  @ViewChild('snav')
  public sidenav: MatSidenav

  user = {
    displayName: 'Aurélie Violette',
  }

  constructor(
    private cdr: ChangeDetectorRef,
    media: MediaMatcher,
    @Inject(MOBILE_MEDIA_QUERY) mobileQuery: string
  ) {
    // Define a listener for responsive design
    this.mobileQuery = media.matchMedia(mobileQuery)
    this._mobileQueryListener = () => cdr.detectChanges()
    this.mobileQuery.addListener(this._mobileQueryListener)
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener)
  }
}
