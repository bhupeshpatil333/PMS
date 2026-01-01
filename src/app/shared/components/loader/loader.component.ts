import { Component } from '@angular/core';
import { LoaderService } from '../../../core/services/loader.service';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-loader',
    imports: [AsyncPipe],
    templateUrl: './loader.component.html',
    styleUrl: './loader.component.scss'
})
export class LoaderComponent {
    constructor(public loaderService: LoaderService) { }
}
