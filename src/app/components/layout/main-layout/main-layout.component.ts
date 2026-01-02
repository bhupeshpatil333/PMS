import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.interface';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { HasRoleDirective } from '../../../core/directives/has-role.directive';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, MatMenuModule, MatButtonModule, HasRoleDirective],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
    isSidebarCollapsed = false;
    user$: Observable<User | null>;

    constructor(public auth: AuthService, private router: Router) {
        this.user$ = this.auth.user$;
    }

    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }

    logout() {
        this.auth.logout();
        this.router.navigate(['/login']);
    }
}
