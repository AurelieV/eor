import { MediaMatcher } from '@angular/cdk/layout'
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core'
import { MatSidenav } from '@angular/material'
import { Observable } from 'rxjs'
import { MOBILE_MEDIA_QUERY } from './tokens'
import { UserInfo, UserService } from './user.service'

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnDestroy, OnInit {
  mobileQuery: MediaQueryList
  private _mobileQueryListener: () => void

  private isSidenavOpen: boolean

  @ViewChild('snav')
  public sidenav: MatSidenav

  user$: Observable<UserInfo>

  constructor(
    private cdr: ChangeDetectorRef,
    media: MediaMatcher,
    @Inject(MOBILE_MEDIA_QUERY) mobileQuery: string,
    private userService: UserService
  ) {
    // Define a listener for responsive design
    this.mobileQuery = media.matchMedia(mobileQuery)
    this._mobileQueryListener = () => cdr.detectChanges()
    this.mobileQuery.addListener(this._mobileQueryListener)
  }

  ngOnInit() {
    this.user$ = this.userService.userInfo
  }

  logout() {
    this.userService.logout()
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener)
  }
}
