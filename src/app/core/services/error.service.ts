import { Injectable } from '@angular/core'
import { MatDialog } from '@angular/material'
import { ErrorComponent } from '@core/components/error/error.component'

@Injectable()
export class ErrorService {
  constructor(private md: MatDialog) {}

  raise(error: string) {
    const dialogRef = this.md.open(ErrorComponent, { disableClose: true })
    dialogRef.componentInstance.error = error
  }
}
