import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router'
import { NotificationService } from '@appModule/services/notification.service'
import { UserService } from '@appModule/services/user.service'
import { map, take, tap } from 'rxjs/operators'
import { environment } from '../../environments/environment'
import { LoginMethod } from '../interfaces'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (environment.configuration.loginMethod === LoginMethod.None) {
      return true
    }
    return this.userService.userInfo$.pipe(
      take(1),
      map((userInfo) => Boolean(userInfo)),
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
  constructor(private userService: UserService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (environment.configuration.loginMethod === LoginMethod.None) {
      return true
    }
    return this.userService.userInfo$.pipe(
      take(1),
      map((userInfo) => !Boolean(userInfo)),
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
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (environment.configuration.loginMethod === LoginMethod.None) {
      return true
    }
    return this.userService.userInfo$.pipe(
      take(1),
      map((userInfo) => {
        if (!userInfo) {
          return false
        }
        if (!route.data.roles.general) {
          return true
        }
        if (typeof route.data.roles.general === 'string') {
          console.log('test', userInfo, route.data.roles.general)
          return userInfo.roles.includes(route.data.roles.general)
        }
        return (route.data.roles.general as Array<string>).every((role) =>
          userInfo.roles.includes(role)
        )
      }),
      tap((isAuthorized) => {
        if (!isAuthorized) {
          this.notificationService.notify(
            'You are not allowed on this section of the app'
          )
        }
      })
    )
  }
}
