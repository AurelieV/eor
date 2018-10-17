import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  TemplateRef,
  ViewChild,
} from '@angular/core'
import { MatSidenav } from '@angular/material'
import { Router } from '@angular/router'
import { HeaderService } from '@appModule/services/header.service'
import { Observable, Subscription } from 'rxjs'
import { SidePanelService } from '../services/side-panel.service'
import { UserInfo, UserService } from '../services/user.service'

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnDestroy, AfterViewInit {
  sidePanelTemplate$: Observable<TemplateRef<any>>
  headerTemplate: TemplateRef<any>
  subscriptions: Subscription[] = []

  @ViewChild('sidePanel')
  public sidePanel: MatSidenav

  userInfo$: Observable<UserInfo>

  constructor(
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private sidePanelService: SidePanelService,
    private router: Router,
    private headerService: HeaderService
  ) {}

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
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}
