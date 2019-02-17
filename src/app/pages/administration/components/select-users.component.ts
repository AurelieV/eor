import { Component, forwardRef, OnDestroy, OnInit } from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms'
import { BehaviorSubject, Observable } from 'rxjs'
import { combineLatest, filter, map, startWith } from 'rxjs/operators'
import { UserWithId } from '../administration.models'
import { AdministrationService } from '../services/administration.service'

@Component({
  selector: 'select-users',
  templateUrl: './select-users.component.html',
  styleUrls: ['./select-users.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectUsersComponent),
      multi: true,
    },
  ],
})
export class SelectUsersComponent implements OnInit, OnDestroy, ControlValueAccessor {
  inputControl = new FormControl()
  filteredUsers$: Observable<UserWithId[]>
  selectedUsers$ = new BehaviorSubject<Array<UserWithId>>([])

  constructor(private admin: AdministrationService) {}

  ngOnInit() {
    this.filteredUsers$ = this.inputControl.valueChanges.pipe(
      startWith(''),
      combineLatest(this.admin.getUsers()),
      map(([filter, users]) => {
        users = users || []
        if (filter && filter.id) {
          return users.filter((user) => user.id === filter.id)
        } else {
          filter = (filter || '').toLowerCase()
          const selectedUsers = this.selectedUsers$.getValue()
          return users.filter(
            (user) =>
              user.name.toLowerCase().includes(filter) &&
              !selectedUsers.some(({ id }) => id === user.id)
          )
        }
      })
    )
    this.inputControl.valueChanges
      .pipe(filter((user) => user && user.id))
      .subscribe((user: UserWithId) => {
        let selectedUsers = this.selectedUsers$.getValue()
        if (!selectedUsers.some(({ id }) => id === user.id)) {
          selectedUsers = selectedUsers.concat(user)
          this.selectedUsers$.next(selectedUsers)
        }
        this.inputControl.setValue('')
      })
  }

  unSelect(userId: string) {
    const selectedUsers = this.selectedUsers$.getValue().filter((u) => u.id !== userId)
    this.selectedUsers$.next(selectedUsers)
  }

  displayFn(user: UserWithId) {
    return user ? `${user.name} (${user.level} - ${user.region})` : undefined
  }

  writeValue(obj: any): void {
    this.selectedUsers$.next(obj || [])
  }
  registerOnChange(fn: any): void {
    this.selectedUsers$.subscribe(fn)
  }
  registerOnTouched(fn: any): void {
    return
  }
  setDisabledState?(isDisabled: boolean): void {
    return
  }

  ngOnDestroy() {
    this.selectedUsers$.complete()
  }
}
