import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { MatPaginatorModule,MatPaginator} from '@angular/material/paginator';
import { ApiRequestLog } from 'app/core/Model/ApiRequestLog.model';
import { TrackingService } from 'app/core/services/tracking.service';
import { CommonModule } from '@angular/common';
import { UserService } from 'app/core/user/user.service';

export interface PeriodicElement {

    requestBody?: string;   
    responseBody?: string;  
}




@Component({
    selector       : 'project',
    templateUrl    : './project.component.html',
    styleUrl: './project.css.component.scss',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('detailExpand', [
          state('collapsed,void', style({height: '0px', minHeight: '0'})),
          state('expanded', style({height: '*'})),
          transition('expanded <=> collapsed', animate('100ms cubic-bezier(0.6, 0.0, 0.8, 1)')),
        ]),
      ],
    standalone     : true,
    imports        : [TranslocoModule,CommonModule, MatIconModule, MatButtonModule, MatRippleModule, MatMenuModule, MatTabsModule, MatButtonToggleModule, NgApexchartsModule, NgFor, NgIf, MatTableModule, NgClass, CurrencyPipe,MatPaginatorModule],
})
export class ProjectComponent implements OnInit, OnDestroy
{
    private _TrackingService = inject(TrackingService);  
    @ViewChild(MatPaginator) _paginator!: MatPaginator;
    chartGithubIssues: ApexOptions = {};
    chartTaskDistribution: ApexOptions = {};
    chartBudgetDistribution: ApexOptions = {};
    chartWeeklyExpenses: ApexOptions = {};
    chartMonthlyExpenses: ApexOptions = {};
    chartYearlyExpenses: ApexOptions = {};
    data: any;;
    activeSessionCount:any
    averageResponseTime:any
    errorCount: number 
    activeSessions: any = [];
    logs: ApiRequestLog[] = [];
    columnsToDisplay: string[] = [
        'timestamp',
        'username',
        'sessionId',
        'requestPath',
        'method',
        'statusCode',
   
    ];
    isSuperAdmin: boolean = false;
    dataSource: MatTableDataSource<ApiRequestLog>;
    columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];

    expandedElement: PeriodicElement | null;
    selectedProject: string = 'ACME Corp. Backend App';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _projectService: ProjectService,
        private _router: Router,
        private cdr: ChangeDetectorRef ,
        private _userService: UserService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this._userService.user$.subscribe(user => {
            if (user && user.roles) {
                console.log('User roles in ProjectComponent:', user.roles); // Log user roles
                this.isSuperAdmin = user.roles.includes('ROLE_SUPER_ADMIN'); // Check for super admin role

                // Load specific data if user is Super Admin
                if (this.isSuperAdmin) {
                    this.loadErrorCount();
                    this.loadActiveSessions();
                    this.loadAverageResponseTime();
                    this.getlogs();
                }
            }
        });
        
        // Get the data
        this._projectService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) =>
            {
                // Store the data
                this.data = data;

                // Prepare the chart data
                this._prepareChartData();
            });
      
        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any): void =>
                    {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any): void =>
                    {
                        this._fixSvgFill(chart.el);
                    },
                },
            },
        };
      

     
    }
    loadErrorCount(): void {
        this._TrackingService.getErrorCount().subscribe(
            (response: string) => {
                console.log('Raw response:', response); // Log the raw response
    
                // Use a regular expression to extract the number from the string
                const match = response.match(/(\d+)/); // This will match any sequence of digits
    
                if (match) {
                    this.errorCount = Number(match[0]); // Convert the matched string to a number
                } else {
                    console.error('No number found in response:', response);
                    this.errorCount = 0; // Handle the case where no number is found
                }
    
                console.log('Error count:', this.errorCount); // Log the final error count
            },
            (error) => {
                console.error('Error fetching error count:', error);
            }
        );
    }
    
    
    loadAverageResponseTime(): void {
        this._TrackingService.getAverageResponseTime().subscribe(
            (response: string) => {
                console.log('Raw response:', response); // Log the raw response
    
                // Use a regular expression to extract the numeric part from the string
                const match = response.match(/(\d+(\.\d+)?)/); // Match digits, including decimal
    
                if (match) {
                    // Convert the matched string to a number and round to three decimal places
                    this.averageResponseTime = Number(match[0]).toFixed(3); // Keeps three decimal places
                } else {
                    console.error('No valid number found in response:', response);
                    this.averageResponseTime = '0.000'; // Handle the case where no number is found
                }
    
                console.log('Average Response Time:', this.averageResponseTime); // Log the final average response time
            },
            (error) => {
                console.error('Error fetching average response time:', error);
            }
        );
    }
    
      loadActiveSessions(): void {
        this._TrackingService.getActiveSessions().subscribe(
          (response: any[]) => {  // Assuming the response is an array of active sessions
            this.activeSessions = response;
            this.activeSessionCount = this.activeSessions.length;  // Count the number of active sessions
            console.log('Active sessions:', this.activeSessions);
            console.log('Number of active sessions:', this.activeSessionCount);
          },
          (error) => {
            console.error('Error fetching active sessions:', error);
          }
        );
      }
      

    getlogs(): void {
        this._TrackingService.getAllLogs().subscribe(
            (response: ApiRequestLog[]) => {
                // Sort logs by timestamp in descending order
                this.logs = response.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
                // Assign the sorted logs to the dataSource
                this.dataSource = new MatTableDataSource<ApiRequestLog>(this.logs);
    
                // Initialize paginator after assigning data
                this.dataSource.paginator = this._paginator;
            },
            (error) => {
                console.error('Error fetching logs:', error);
            }
        );
    }
    
    
    
    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Fix the SVG fill references. This fix must be applied to all ApexCharts
     * charts in order to fix 'black color on gradient fills on certain browsers'
     * issue caused by the '<base>' tag.
     *
     * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
     *
     * @param element
     * @private
     */
    private _fixSvgFill(element: Element): void
    {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
            .filter(el => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) =>
            {
                const attrVal = el.getAttribute('fill');
                el.setAttribute('fill', `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`);
            });
    }

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(): void
    {

        this.chartBudgetDistribution = {
            chart      : {
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'radar',
                sparkline : {
                    enabled: true,
                },
            },
            colors     : ['#818CF8'],
            dataLabels : {
                enabled   : true,
                formatter : (val: number): string | number => `${val}%`,
                textAnchor: 'start',
                style     : {
                    fontSize  : '13px',
                    fontWeight: 500,
                },
                background: {
                    borderWidth: 0,
                    padding    : 4,
                },
                offsetY   : -15,
            },
            markers    : {
                strokeColors: '#818CF8',
                strokeWidth : 4,
            },
            plotOptions: {
                radar: {
                    polygons: {
                        strokeColors   : 'var(--fuse-border)',
                        connectorColors: 'var(--fuse-border)',
                    },
                },
            },
            series     : this.data.budgetDistribution.series,
            stroke     : {
                width: 2,
            },
            tooltip    : {
                theme: 'dark',
                y    : {
                    formatter: (val: number): string => `${val}%`,
                },
            },
            xaxis      : {
                labels    : {
                    show : true,
                    style: {
                        fontSize  : '12px',
                        fontWeight: '500',
                    },
                },
                categories: this.data.budgetDistribution.categories,
            },
            yaxis      : {
                max       : (max: number): number => parseInt((max + 10).toFixed(0), 10),
                tickAmount: 7,
            },
        };
        // Github issues
        this.chartGithubIssues = {
            chart      : {
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'line',
                toolbar   : {
                    show: false,
                },
                zoom      : {
                    enabled: false,
                },
            },
            colors     : ['#64748B', '#94A3B8'],
            dataLabels : {
                enabled        : true,
                enabledOnSeries: [0],
                background     : {
                    borderWidth: 0,
                },
            },
            grid       : {
                borderColor: 'var(--fuse-border)',
            },
            labels     : this.data.githubIssues.labels,
            legend     : {
                show: false,
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%',
                },
            },
            series     : this.data.githubIssues.series,
            states     : {
                hover: {
                    filter: {
                        type : 'darken',
                        value: 0.75,
                    },
                },
            },
            stroke     : {
                width: [3, 0],
            },
            tooltip    : {
                followCursor: true,
                theme       : 'dark',
            },
            xaxis      : {
                axisBorder: {
                    show: false,
                },
                axisTicks : {
                    color: 'var(--fuse-border)',
                },
                labels    : {
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
                tooltip   : {
                    enabled: false,
                },
            },
            yaxis      : {
                labels: {
                    offsetX: -16,
                    style  : {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
            },
        };

        // Task distribution
        this.chartTaskDistribution = {
            chart      : {
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'polarArea',
                toolbar   : {
                    show: false,
                },
                zoom      : {
                    enabled: false,
                },
            },
            labels     : this.data.taskDistribution.labels,
            legend     : {
                position: 'bottom',
            },
            plotOptions: {
                polarArea: {
                    spokes: {
                        connectorColors: 'var(--fuse-border)',
                    },
                    rings : {
                        strokeColor: 'var(--fuse-border)',
                    },
                },
            },
            series     : this.data.taskDistribution.series,
            states     : {
                hover: {
                    filter: {
                        type : 'darken',
                        value: 0.75,
                    },
                },
            },
            stroke     : {
                width: 2,
            },
            theme      : {
                monochrome: {
                    enabled       : true,
                    color         : '#93C5FD',
                    shadeIntensity: 0.75,
                    shadeTo       : 'dark',
                },
            },
            tooltip    : {
                followCursor: true,
                theme       : 'dark',
            },
            yaxis      : {
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
            },
        };

        // Budget distribution


        // Weekly expenses
        this.chartWeeklyExpenses = {
            chart  : {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'line',
                sparkline : {
                    enabled: true,
                },
            },
            colors : ['#22D3EE'],
            series : this.data.weeklyExpenses.series,
            stroke : {
                curve: 'smooth',
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.weeklyExpenses.labels,
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => `$${val}`,
                },
            },
        };

        // Monthly expenses
        this.chartMonthlyExpenses = {
            chart  : {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'line',
                sparkline : {
                    enabled: true,
                },
            },
            colors : ['#4ADE80'],
            series : this.data.monthlyExpenses.series,
            stroke : {
                curve: 'smooth',
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.monthlyExpenses.labels,
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => `$${val}`,
                },
            },
        };

        // Yearly expenses
        this.chartYearlyExpenses = {
            chart  : {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'line',
                sparkline : {
                    enabled: true,
                },
            },
            colors : ['#FB7185'],
            series : this.data.yearlyExpenses.series,
            stroke : {
                curve: 'smooth',
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.yearlyExpenses.labels,
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => `$${val}`,
                },
            },
        };
    }
}
