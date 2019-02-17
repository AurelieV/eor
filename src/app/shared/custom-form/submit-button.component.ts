import { Component, EventEmitter, Input, Output } from '@angular/core'
import { ThemePalette } from '@angular/material'

@Component({
  selector: 'custom-submit-button',
  template: `
    <button mat-flat-button (click)="btnClick($event)" [color]="color" [class.loading]="loading" [disabled]="loading || disabled">
      <span *ngIf="!loading"><ng-content></ng-content></span>
      <span *ngIf="loading">{{spinnerText}}</span>
      <mat-spinner *ngIf="loading" class="spinner" diameter="18" [color]="spinnerColor" mode="indeterminate"></mat-spinner>
    </button>
  `,
  styles: [
    `
      button /deep/ .mat-button-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      button.loading {
        cursor: not-allowed;
      }
      .spinner {
        margin-top: 0px;
        margin-left: 10px;
      }
    `,
  ],
})
export class CustomSubmitButton {
  @Input()
  color: ThemePalette = 'primary'
  @Input()
  spinnerColor: ThemePalette = 'accent'
  @Input()
  loading: boolean = false
  @Input()
  disabled: boolean = false
  @Input()
  spinnerText: string = '...'
  @Output()
  onClick = new EventEmitter()

  btnClick(e): void {
    this.onClick.emit(e)
  }
}
