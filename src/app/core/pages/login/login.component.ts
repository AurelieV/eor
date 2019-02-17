import { Configuration } from '@/app/interfaces'
import { environment } from '@/environments/environment'
import { Component } from '@angular/core'
import { UserService } from '@core/services/user.service'

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  config: Configuration = environment.configuration
  isLoading: boolean = false

  constructor(private userService: UserService) {}

  get isUsingJudgeApps() {
    return this.config.loginMethod === 'JUDGE_APPS'
  }

  login() {
    this.isLoading = true
    if (this.isUsingJudgeApps) {
      this.userService.loginWithJudgeApps()
    }
  }
}
