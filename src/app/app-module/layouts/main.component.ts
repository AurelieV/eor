import { MediaMatcher } from '@angular/cdk/layout'
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  TemplateRef,
  ViewChild,
} from '@angular/core'
import { MatSidenav } from '@angular/material'
import { Router } from '@angular/router'
import { HeaderService } from '@appModule/services/header.service'
import { Observable, Subscription } from 'rxjs'
import { MOBILE_MEDIA_QUERY } from '../../tokens'
import { SidePanelService } from '../services/side-panel.service'
import { UserInfo, UserService } from '../services/user.service'

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnDestroy, AfterViewInit {
  mobileQuery: MediaQueryList
  private _mobileQueryListener: () => void
  sidePanelTemplate$: Observable<TemplateRef<any>>
  headerTemplate: TemplateRef<any>
  subscriptions: Subscription[] = []

  @ViewChild('sidePanel')
  public sidePanel: MatSidenav

  userInfo$: Observable<UserInfo>

  constructor(
    private cdr: ChangeDetectorRef,
    media: MediaMatcher,
    @Inject(MOBILE_MEDIA_QUERY) mobileQuery: string,
    private userService: UserService,
    private sidePanelService: SidePanelService,
    private router: Router,
    private headerService: HeaderService
  ) {
    // Define a listener for responsive design
    this.mobileQuery = media.matchMedia(mobileQuery)
    this._mobileQueryListener = () => cdr.detectChanges()
    this.mobileQuery.addListener(this._mobileQueryListener)
  }

  ngOnInit() {
    this.sidePanelTemplate$ = this.sidePanelService.templateRef$
    this.userInfo$ = this.userService.userInfo$
    this.subscriptions.push(
      this.headerService.templateRef$.subscribe((template) => {
        this.headerTemplate = template
        this.cdr.detectChanges()
      })
    )
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
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}
