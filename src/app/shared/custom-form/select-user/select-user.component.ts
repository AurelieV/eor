import { User } from '@/app/models'
import { Component, forwardRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms'
import { AuthenticationService } from '@core/services/authentication.service'
import { BehaviorSubject, Observable } from 'rxjs'
import { combineLatest, map, startWith } from 'rxjs/operators'

@Component({
  selector: 'select-user',
  templateUrl: './select-user.component.html',
  styleUrls: ['./select-user.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectUserComponent),
      multi: true,
    },
  ],
})
export class SelectUserComponent implements OnInit, OnDestroy, ControlValueAccessor {
  inputControl = new FormControl()
  filteredUsers$: Observable<User[]>
  selectedUser$ = new BehaviorSubject<string>('')

  @ViewChild('inputRef') inputElement

  constructor(private authentication: AuthenticationService) {}

  ngOnInit() {
    this.filteredUsers$ = this.inputControl.valueChanges.pipe(
      startWith(''),
      combineLatest(this.authentication.getUsers()),
      map(([filter, users]) => {
        users = users || []
        filter = (filter || '').toLowerCase()
        return users.filter((user) => user.name.toLowerCase().includes(filter))
      })
    )
    this.inputControl.valueChanges.subscribe((user: string) => {
      this.selectedUser$.next(user)
    })
  }

  focus() {
    this.inputElement.nativeElement.focus()
  }

  writeValue(obj: any): void {
    this.selectedUser$.next(obj || '')
  }
  registerOnChange(fn: any): void {
    this.selectedUser$.subscribe(fn)
  }
  registerOnTouched(fn: any): void {
    return
  }
  setDisabledState?(isDisabled: boolean): void {
    return
  }

  ngOnDestroy() {
    this.selectedUser$.complete()
  }
}
