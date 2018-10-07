export interface Configuration {
  loginMethod: LoginMethod
}

export enum LoginMethod {
  JudgeApps = 'JUDGE_APPS',
  None = 'NONE',
}
