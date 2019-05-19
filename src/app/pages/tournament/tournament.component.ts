import { Tournament } from '@/app/models'
import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { HeaderService } from '@core/services/header.service'
import { Zone } from '@pages/administration/administration.models'
import { Observable, Subscription } from 'rxjs'
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

  @ViewChild('header')
  private headerTemplateRef: TemplateRef<any>

  constructor(
    private route: ActivatedRoute,
    private store: TournamentStore,
    private headerService: HeaderService
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
  }

  ngAfterViewInit() {
    this.headerService.loadTemplate(this.headerTemplateRef)
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe())
    this.headerService.resetTemplate()
  }
}
