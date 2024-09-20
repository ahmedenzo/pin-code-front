import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector     : 'auth-sign-in',
    templateUrl  : './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports      : [RouterLink, FuseAlertComponent, NgIf,
         FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, 
         MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm;
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = { type: 'error', message: '' };

    private _redirectURL: string = '/signed-in-redirect';  // Default redirect URL after successful sign-in

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    ngOnInit(): void {
        // Create the sign-in form
        this.signInForm = this._formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', Validators.required],
        });

        // Get the redirect URL from the query parameters or set default
        const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL');
        this._redirectURL = redirectURL && redirectURL !== '/404-not-found' ? redirectURL : '/signed-in-redirect';
    }

    signIn(): void {
        // If the form is invalid, return
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form while processing
        this.signInForm.disable();
        this.showAlert = false;

        // Call the sign-in method
        this._authService.signIn(this.signInForm.value).subscribe(
            () => {
                // On successful sign-in, navigate to the valid redirect URL
                this._router.navigateByUrl(this._redirectURL);
            },
            () => {
                // On failed sign-in, reset the form and clear the redirect URL
                this.signInForm.enable();
                this.signInNgForm.resetForm();

                // Set the alert message
                this.alert = {
                    type: 'error',
                    message: 'Wrong username or password!',
                };

                // Show the alert
                this.showAlert = true;

                // Remove the redirectURL from the URL to prevent further issues
                this._router.navigate([], {
                    queryParams: { redirectURL: null },
                    queryParamsHandling: 'merge', // Merge with the existing query params and clear redirectURL
                });
            }
        );
    }
}