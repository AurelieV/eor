import { Component } from '@angular/core'
import { environment } from '../../../environments/environment'
import { Configuration } from '../../interfaces'
import { UserService } from '../services/user.service'

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  config: Configuration = environment.configuration

  constructor(private userService: UserService) {}

  get isUsingJudgeApps() {
    return this.config.loginMethod === 'JUDGE_APPS'
  }

  login() {
    if (this.isUsingJudgeApps) {
      this.userService.loginWithJudgeApps()
    }
  }
}
