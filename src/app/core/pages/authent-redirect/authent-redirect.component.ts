import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthenticationService } from '@core/services/authentication.service'
import { NotificationService } from '@core/services/notification.service'
import { take } from 'rxjs/operators'

@Component({
  selector: 'authent-redirect',
  template: `
    <div class="loader">
      <mat-progress-spinner color="accent" mode="indeterminate"></mat-progress-spinner>
    </div>
    <p>Process authentification ...</p>
  `,
  styleUrls: ['./authent-redirect.component.scss'],
})
export class AuthentRedirectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authent: AuthenticationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      if (!params.has('code')) {
        this.notificationService.notify('Incorrect authentification')
        return this.router.navigate(['/'])
      }
      this.authent.processJudgeAppsToken(params.get('code')).subscribe(
        () => {
          this.router.navigate(['/'])
        },
        () => {
          this.notificationService.notify('Impossible to process authentification')
          this.router.navigate(['/'])
        }
      )
    })
  }
}
