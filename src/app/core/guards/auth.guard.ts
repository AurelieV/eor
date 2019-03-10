import { LoginMethod } from '@/app/interfaces'
import { environment } from '@/environments/environment'
import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router'
import { AuthenticationService } from '@core/services/authentication.service'
import { NotificationService } from '@core/services/notification.service'
import { map, take, tap } from 'rxjs/operators'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authent: AuthenticationService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (environment.configuration.loginMethod === LoginMethod.None) {
      return true
    }
    return this.authent.user$.pipe(
      take(1),
      map((user) => Boolean(user)),
      tap((isConnected) => {
        if (!isConnected) {
          this.router.navigate(['/login'])
        }
      })
    )
  }
}

@Injectable()
export class NotAuthGuard implements CanActivate {
  constructor(private authent: AuthenticationService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (environment.configuration.loginMethod === LoginMethod.None) {
      return true
    }
    return this.authent.user$.pipe(
      take(1),
      map((user) => !Boolean(user)),
      tap((isNotConnected) => {
        if (!isNotConnected) {
          this.router.navigate(['/'])
        }
      })
    )
  }
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private authent: AuthenticationService,
    private notificationService: NotificationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (environment.configuration.loginMethod === LoginMethod.None) {
      return true
    }
    return this.authent.roles$.pipe(
      take(1),
      map((roles) => {
        if (!route.data.roles.general) {
          return true
        }
        if (typeof route.data.roles.general === 'string') {
          return roles.includes(route.data.roles.general)
        }
        return (route.data.roles.general as Array<string>).every((role) => roles.includes(role))
      }),
      tap((isAuthorized) => {
        if (!isAuthorized) {
          this.notificationService.notify('You are not allowed on this section of the app')
        }
      })
    )
  }
}
