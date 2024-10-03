import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; // <-- Add this import
import { BankServiceService } from 'app/core/services/bank-service.service';

@Component({
    selector       : 'settings-team',
    templateUrl    : './team.component.html',
    styleUrls: ['./team.component.css'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, NgFor, NgIf, MatSelectModule, MatOptionModule, TitleCasePipe, MatSlideToggleModule], // <-- Add MatSlideToggleModule here
})
export class SettingsTeamComponent implements OnInit
{
    private _bankService = inject(BankServiceService);
    
    admins : any [] = [];

    constructor( private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.getadmins();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    getadmins(): void {
        this._bankService.GetAdmins().subscribe({
            next: (response) => {
                console.log('Fetched Admins data:', response);
                if (Array.isArray(response) && response.length > 0) {
                    this.admins = response;
                    console.log('Admins data team:', this.admins);
                    this.cdr.detectChanges(); 
                } else {
                    console.warn('No valid admins data found. Response structure:', response);
                }
            },
            error: (error) => {
                console.error('Error fetching admins:', error);
            }
        });
    }

    toggleActive(member: any): void {
        member.active = !member.active; // Toggle the active state
        console.log('Updated member status:', member);
    }
}
