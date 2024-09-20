import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector     : 'auth-unlock-session',
    templateUrl  : './unlock-session.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports      : [NgIf, FuseAlertComponent, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
})
export class AuthUnlockSessionComponent implements OnInit
{
    @ViewChild('unlockSessionNgForm') unlockSessionNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: '',
    };
    username: string;
    showAlert: boolean = false;
    unlockSessionForm: UntypedFormGroup;
    private _username: string;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _userService: UserService,
    )
    {
    }

    ngOnInit(): void {
        // Get the user's name (if available)
        this._userService.user$.subscribe((user) => {
            if (user) {
                this.username = user.username;
                this._username = user.username;
                console.log('Username from user service:', this._username);
            } else {
                console.log('No user available');
            }
        });
    
        // Create the form with 'username' as the control name
        this.unlockSessionForm = this._formBuilder.group({
            username: [
                {
                    value: this._username,
                    disabled: true,
                },
            ],
            password: ['', Validators.required],
        });
    
        console.log('Form controls:', this.unlockSessionForm.controls);
    }
    
    unlock(): void
    {
        // Return if the form is invalid
        if ( this.unlockSessionForm.invalid )
        {
            return;
        }

        // Disable the form
        this.unlockSessionForm.disable();

        // Hide the alert
        this.showAlert = false;

        this._authService.signIn({
            username   : this._username ?? '',
            password: this.unlockSessionForm.get('password').value,
        }).subscribe(
            () =>
            {
                const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

                // Navigate to the redirect URL
                this._router.navigateByUrl(redirectURL);
            },
            (response) =>
            {
                // Re-enable the form
                this.unlockSessionForm.enable();

                // Reset the form
                this.unlockSessionNgForm.resetForm({
                    name: {
                        value   : this.username,
                        disabled: true,
                    },
                });

                // Set the alert
                this.alert = {
                    type   : 'error',
                    message: 'Invalid password',
                };

                // Show the alert
                this.showAlert = true;
            },
        );
    }
}
