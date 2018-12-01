export interface Configuration {
  loginMethod: LoginMethod
  softwares: Software[]
}

export enum LoginMethod {
  JudgeApps = 'JUDGE_APPS',
  None = 'NONE',
}

export enum Software {
  'WLTR' = 'WLTR',
  'WER' = 'WER',
  'Pokemon' = 'Pokemon',
}

export interface Environnement {
  production: boolean
  firebase: any
  authenticateUrl: string
  authenticateSettings: any
  configuration: Configuration
}
