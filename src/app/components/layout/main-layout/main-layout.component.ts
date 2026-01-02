import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

import { CommonModule, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.interface';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { HasRoleDirective } from '../../../core/directives/has-role.directive';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, MatMenuModule, MatButtonModule, MatIconModule, HasRoleDirective],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
    isSidebarCollapsed = false;
    user$: Observable<User | null>;

    constructor(public auth: AuthService, private router: Router, private dialog: MatDialog) {
        this.user$ = this.auth.user$;
    }

    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }

    logout() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: {
                title: 'Confirm Logout?',
                message: 'Are you sure you want to logout?',
                confirmText: 'Yes, Logout',
                cancelText: 'Cancel',
                type: 'delete' // reusing 'delete' style (red) for logout as it's a destructive/exit action, or could be neutral
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.auth.logout();
                this.router.navigate(['/login']);
            }
        });
    }
}
