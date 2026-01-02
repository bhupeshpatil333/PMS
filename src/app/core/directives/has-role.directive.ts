import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.interface';

@Directive({
    selector: '[appHasRole]',
    standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
    @Input('appHasRole') allowedRoles: string[] = [];
    private sub: Subscription | null = null;

    constructor(
        private authService: AuthService,
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef
    ) { }

    ngOnInit(): void {
        this.sub = this.authService.user$.subscribe((user: User | null) => {
            this.updateView(user);
        });
    }

    private updateView(user: User | null): void {
        this.viewContainer.clear();

        if (user && this.allowedRoles.includes(user.role)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        }
    }

    ngOnDestroy(): void {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }
}
