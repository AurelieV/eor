import { Filters } from '@/app/models'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { TournamentStore } from '@pages/tournament/services/tournament-store.service'

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

  constructor(private store: TournamentStore) {}

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
