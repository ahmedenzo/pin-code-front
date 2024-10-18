import { NgFor, NgIf, DatePipe, AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardHolderLoadReport } from 'app/core/Model/file.model';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { TabCardHolderService } from 'app/core/services/fileupload.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableDataSource } from '@angular/material/table';
import { FuseAlertComponent, FuseAlertService } from '@fuse/components/alert';

@Component({
    selector: 'file-manager-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        AsyncPipe,
        RouterOutlet,
        RouterLink,
        FuseAlertComponent,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatSidenavModule,
        MatProgressBarModule,
    ],
})
export class FileManagerListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    uploadProgress: number = 0;
    isUploading: boolean = false;
    loadReports: CardHolderLoadReport[] = [];
    private _fuseAlertService = inject(FuseAlertService);
    dataSource = new MatTableDataSource<CardHolderLoadReport>();
    displayedColumns: string[] = ['fileName', 'loadDate', 'createdCount', 'updatedCount', 'errorDetails']; // Columns to display
    errorMessage: string | null = null;
    successMessage: string | null = null;
    items: { folders: any[]; files: any[]; path: any[] } = { folders: [], files: [], path: [] };

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _fileuploadService: TabCardHolderService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
    ) {}

    ngOnInit(): void {
        // Fetch load reports and assign them to the table data source
        this._fileuploadService.getAllLoadReports()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((reports: CardHolderLoadReport[]) => {
                this.loadReports = reports;
                this.dataSource.data = reports;  // Assign data to the table
                this._changeDetectorRef.markForCheck();  // Trigger UI update
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        if (file) {
            this.isUploading = true;
            this.uploadProgress = 0;
            this.successMessage = null; // Clear success message
            this.errorMessage = null;   // Clear error message
    
            this._fileuploadService.uploadFile(file).pipe(takeUntil(this._unsubscribeAll))
                .subscribe({
                    next: (event) => {
                        if (event.status === 'progress') {
                            this.uploadProgress = event.progress;  // Update progress
                            this._changeDetectorRef.markForCheck(); // Trigger UI update
                        } else if (event.status === 'completed') {
                            this.isUploading = false;
                            this.successMessage = 'File uploaded successfully!'; // Set success message
                            
                            // Hide success message after 2 seconds
                            setTimeout(() => {
                                this.successMessage = null;
                                this._changeDetectorRef.markForCheck(); // Ensure UI update
                            }, 2000);
    
                            // Optionally, refresh the items list
                            this._fileuploadService.getAllLoadReports()
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((reports: CardHolderLoadReport[]) => {
                                    this.loadReports = reports;
                                    this._changeDetectorRef.markForCheck();
                                });
                        }
                    },
                    error: (error) => {
                        console.error('Error uploading file:', error);
                        this.errorMessage = `Error uploading file: ${error.message}`; // Set error message
                        this.isUploading = false;
                        
                        // Hide error message after 4 seconds
                        setTimeout(() => {
                            this.errorMessage = null;
                            this._changeDetectorRef.markForCheck(); // Ensure UI update
                        }, 4000);
    
                        this._changeDetectorRef.markForCheck();
                    }
                });
        }
    }
    
    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    showAlert(): void {
        this._fuseAlertService.show('myAlertName');  // Make sure 'myAlertName' matches the alert name in the template
    }
  
    dismissAlert(): void {
        this._fuseAlertService.dismiss('myAlertName'); 
    }
}
