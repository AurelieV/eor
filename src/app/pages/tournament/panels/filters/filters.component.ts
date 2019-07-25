import { Filters } from '@/app/models'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { TournamentStore } from '@pages/tournament/services/tournament-store.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
  selector: 'filters-panel',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersPanelComponent {
  @Input() filters: Filters
  // @Input() sortBy: SortBy
  @Input() isOutstandings: boolean
  isCoverage$: Observable<boolean>

  constructor(private store: TournamentStore) {
    this.isCoverage$ = this.store.roles$.pipe(map((roles) => roles.includes('coverage')))
  }

  toggle(field: string) {
    this.store.setFilters({
      ...this.filters,
      [field]: !this.filters[field],
    })
  }

  // changeSortBy(sortBy) {
  //   if (sortBy !== this.sortBy) {
  //     this.store.setSortBy(sortBy)
  //   }
  // }
}
