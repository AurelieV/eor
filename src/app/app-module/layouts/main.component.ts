import { MediaMatcher } from '@angular/cdk/layout'
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core'
import { MatSidenav } from '@angular/material'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'
import { MOBILE_MEDIA_QUERY } from '../../tokens'
import { SidePanelService } from '../services/side-panel.service'
import { UserInfo, UserService } from '../services/user.service'

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnDestroy, OnInit, AfterViewInit {
  mobileQuery: MediaQueryList
  private _mobileQueryListener: () => void
  sidePanelTemplate$: Observable<TemplateRef<any>>

  @ViewChild('sidePanel')
  public sidePanel: MatSidenav

  userInfo$: Observable<UserInfo>

  constructor(
    cdr: ChangeDetectorRef,
    media: MediaMatcher,
    @Inject(MOBILE_MEDIA_QUERY) mobileQuery: string,
    private userService: UserService,
    private sidePanelService: SidePanelService,
    private router: Router
  ) {
    // Define a listener for responsive design
    this.mobileQuery = media.matchMedia(mobileQuery)
    this._mobileQueryListener = () => cdr.detectChanges()
    this.mobileQuery.addListener(this._mobileQueryListener)

    this.sidePanelTemplate$ = this.sidePanelService.templateRef$
  }

  ngOnInit() {
    this.userInfo$ = this.userService.userInfo$
  }

  ngAfterViewInit() {
    this.sidePanelService.sidePanel = this.sidePanel
  }

  logout() {
    this.userService.logout().then(() => this.router.navigate(['/login']))
  }

  get isOpen() {
    return this.sidePanelService.isOpen
  }

  closeSide() {
    this.sidePanelService.close()
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener)
  }
}
