import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
    const loaderService = inject(LoaderService);

    // Optional: Don't show loader for specific URLs if needed
    // if (req.url.includes('some-background-api')) return next(req);

    loaderService.show();

    return next(req).pipe(
        finalize(() => loaderService.hide())
    );
};
