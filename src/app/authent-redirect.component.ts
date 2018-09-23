import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { take } from 'rxjs/operators'
import { UserService } from './user.service'

@Component({
  selector: 'authent-redirect',
  template: 'Loading ....',
})
export class AuthentRedirectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      if (!params.has('code')) {
        //this.notificationService.notify('Incorrect authentification')
        return this.router.navigate(['/'])
      }
      this.userService.processJudgeAppsToken(params.get('code')).subscribe(
        () => {
          this.router.navigate(['/'])
        },
        () => {
          // this.notificationService.notify(
          //   'Impossible to process authentification'
          // )
          this.router.navigate(['/'])
        }
      )
    })
  }
}
