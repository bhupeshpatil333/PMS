import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map, take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const roleGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const toastr = inject(ToastrService);

    const expectedRoles = route.data['roles'] as string[];

    return auth.user$.pipe(
        take(1),
        map(user => {
            if (!user) {
                router.navigate(['/login']);
                return false;
            }

            if (expectedRoles && expectedRoles.length > 0 && !expectedRoles.includes(user.role)) {
                toastr.error('You do not have permission to access this resource', 'Access Denied');
                router.navigate(['/dashboard']);
                return false;
            }

            return true;
        })
    );
};
