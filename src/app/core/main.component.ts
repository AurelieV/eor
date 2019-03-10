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
import { HeaderService } from '@core/services/header.service'
import { Observable, Subscription } from 'rxjs'
import { AuthenticationService, ConnectedUser } from './services/authentication.service'
import { SidePanelService } from './services/side-panel.service'

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

  user$: Observable<ConnectedUser>

  constructor(
    private cdr: ChangeDetectorRef,
    private authent: AuthenticationService,
    private sidePanelService: SidePanelService,
    private router: Router,
    private headerService: HeaderService
  ) {}

  ngOnInit() {
    this.sidePanelTemplate$ = this.sidePanelService.templateRef$
    this.user$ = this.authent.user$
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
    this.authent.logout().then(() => this.router.navigate(['/login']))
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
