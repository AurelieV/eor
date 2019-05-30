import {
  Action,
  Filters,
  SortBy,
  Table,
  TableStatus,
  Tournament,
  ViewMode,
  ZoneInfo,
} from '@/app/models'
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling'
import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { HeaderService } from '@core/services/header.service'
import { NotificationService } from '@core/services/notification.service'
import { SidePanelService } from '@core/services/side-panel.service'
import { Zone } from '@pages/administration/administration.models'
import { Observable, Subscription } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { TournamentStore, ZonesTables } from './services/tournament-store.service'

@Component({
  selector: 'tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.scss'],
})
export class TournamentComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription[] = []
  zones$: Observable<Zone[]>
  zoneTables$: Observable<ZonesTables>
  tournament$: Observable<Tournament>
  zoneInfos$: Observable<Observable<ZoneInfo>[]>
  allInfo$: Observable<ZoneInfo>
  filters$: Observable<Filters>
  actions$: Observable<Action[]>
  sortedTables$: Observable<Table[]>
  sortBy$: Observable<SortBy>
  isOutstandings$: Observable<boolean>

  zoneInfoSelected: number = null
  zoneInfoItemWidthRatio = 0.82

  selectedTable: Table = null

  isRestarting: boolean = false
  viewMode: ViewMode = 'small'
  markAllEmptyStatus: TableStatus

  @ViewChild('header')
  private headerTemplateRef: TemplateRef<any>
  @ViewChild('menuHeader')
  private menuHeaderTemplateRef: TemplateRef<any>
  @ViewChild('clock')
  private clockTemplateRef: TemplateRef<any>
  @ViewChild('filters')
  private filtersTemplateRef: TemplateRef<any>
  @ViewChild('actions')
  private actionsTemplateRef: TemplateRef<any>
  @ViewChild('addTime')
  private addTimeTemplateRef: TemplateRef<any>
  @ViewChild('table')
  private tableTemplateRef: TemplateRef<any>
  @ViewChild('importPairings')
  private importPairingsRef: TemplateRef<any>
  @ViewChild('outstandings')
  private outstandingsRef: TemplateRef<any>
  @ViewChild('importResults')
  private importResultsRef: TemplateRef<any>
  @ViewChild('markAllEmpty')
  private markAllEmptyRef: TemplateRef<any>

  @ViewChild(CdkScrollable)
  private zoneInfoContainer: CdkScrollable

  constructor(
    private route: ActivatedRoute,
    private store: TournamentStore,
    private headerService: HeaderService,
    private sidePanel: SidePanelService,
    private scroller: ScrollDispatcher,
    private notifier: NotificationService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.route.paramMap.subscribe((params) => {
        const key = params.get('tournamentId')
        if (key) {
          this.store.key = key
        }
      })
    )
    this.zones$ = this.store.zones$
    this.zoneTables$ = this.store.zonesTables$
    this.tournament$ = this.store.tournament$
    this.zoneInfos$ = this.store.zoneInfos$
    this.allInfo$ = this.store.allInfo$
    this.filters$ = this.store.filters$
    this.actions$ = this.store.actions$
    this.sortedTables$ = this.store.sortedTables$
    this.sortBy$ = this.store.sortBy$
    this.isOutstandings$ = this.store.isOutstandings$
    this.subscriptions.push(
      this.store.zoneInfoSelected$.subscribe(
        (zoneInfoSelected) => (this.zoneInfoSelected = zoneInfoSelected)
      )
    )
    this.scroller
      .scrolled()
      .pipe(debounceTime(300))
      .subscribe((scrolable) => {
        if (scrolable) {
          const scroll = scrolable.measureScrollOffset('left')
          const width = scrolable.getElementRef().nativeElement.clientWidth
          const itemWidth = width * this.zoneInfoItemWidthRatio
          const arrayIndex = Math.floor(scroll / itemWidth)

          const distToStart = scroll - arrayIndex * itemWidth
          const distToEnd = (arrayIndex + 1) * itemWidth - scroll
          if (distToStart < itemWidth * 0.1) {
            scrolable.scrollTo({ left: arrayIndex * itemWidth })
          } else if (distToEnd < itemWidth * 0.1) {
            scrolable.scrollTo({ left: (arrayIndex + 1) * itemWidth })
          }
        }
      })
    this.subscriptions.push(this.sidePanel.onClose$.subscribe(() => (this.selectedTable = null)))
  }

  ngAfterViewInit() {
    this.headerService.loadTemplate(this.headerTemplateRef)
    this.headerService.loadMenuTemplate(this.menuHeaderTemplateRef)
  }

  onEditClock() {
    this.sidePanel.open(this.clockTemplateRef)
  }

  onEditFilter() {
    this.sidePanel.open(this.filtersTemplateRef)
  }

  onOpenActions() {
    this.sidePanel.open(this.actionsTemplateRef)
  }

  onOpenTable(table) {
    this.selectedTable = table
    this.sidePanel.open(this.tableTemplateRef)
  }

  onAddTime() {
    this.sidePanel.open(this.addTimeTemplateRef, this.tableTemplateRef)
  }

  onTimeAdded() {
    this.sidePanel.back()
  }

  onPairingsImported() {
    this.sidePanel.back()
  }

  onResultsImported() {
    this.sidePanel.back()
  }

  onOutstandingsDefined() {
    this.sidePanel.close()
  }

  onAllEmptyMarked() {
    this.sidePanel.close()
  }

  onActionClick(key: string) {
    switch (key) {
      case 'add-time':
        this.sidePanel.open(this.addTimeTemplateRef, this.actionsTemplateRef)
        break
      case 'end-round':
        this.store.restart().then(() => {
          this.notifier.notify('Round reset')
          this.sidePanel.close()
        })
        break
      case 'import-pairings':
        this.sidePanel.open(this.importPairingsRef, this.actionsTemplateRef)
        break
      case 'import-results':
        this.sidePanel.open(this.importResultsRef, this.actionsTemplateRef)
        break
      case 'go-outstanding':
        this.sidePanel.open(this.outstandingsRef, this.actionsTemplateRef)
        break
      case 'mark-all-empty-green':
        this.markAllEmptyStatus = 'done'
        this.sidePanel.open(this.markAllEmptyRef, this.actionsTemplateRef)
        break
      case 'mark-all-empty-red':
        this.markAllEmptyStatus = 'playing'
        this.sidePanel.open(this.markAllEmptyRef, this.actionsTemplateRef)
        break
      default:
        console.log('todo', key)
    }
  }

  onZoneInfoClick(zoneIndex, arrayIndex) {
    this.store.zoneInfoSelected = zoneIndex
    window.scrollTo(0, 0)

    // Make visible
    const width = this.zoneInfoContainer.getElementRef().nativeElement.clientWidth
    const itemWidth = width * this.zoneInfoItemWidthRatio
    const scroll = this.zoneInfoContainer.measureScrollOffset('left')

    const itemLeft = itemWidth * arrayIndex
    const itemRight = itemWidth * (arrayIndex + 1)
    const windowLeft = scroll
    const windowRight = scroll + width

    const isLeftVisible = itemLeft >= windowLeft && itemLeft <= windowRight
    const isRightVisible = itemRight >= windowLeft && itemRight <= windowRight

    if (!isLeftVisible || !isRightVisible) {
      this.zoneInfoContainer.scrollTo({ left: arrayIndex * itemWidth })
    }
  }

  closePanel() {
    this.sidePanel.close()
  }

  toggleViewMode() {
    switch (this.viewMode) {
      case 'small':
        this.viewMode = 'medium'
        break
      case 'medium':
        this.viewMode = 'large'
        break
      case 'large':
        this.viewMode = 'small'
    }
  }

  trackbyIdFn(index, val) {
    return val.id
  }

  trackbyIndexFn(index, val) {
    return index
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe())
    this.headerService.resetAll()
  }
}
