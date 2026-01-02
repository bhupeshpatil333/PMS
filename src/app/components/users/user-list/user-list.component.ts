import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.interface';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { UserFormComponent } from '../user-form/user-form.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-user-list',
    imports: [SharedMaterialModule, AsyncPipe],
    templateUrl: './user-list.component.html',
    styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
    dataSource = new MatTableDataSource<User>([]);
    displayedColumns: string[] = ['fullName', 'email', 'role', 'actions'];

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(private userService: UserService, private dialog: MatDialog) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers() {
        this.userService.getAllUsers().subscribe(users => {
            this.dataSource.data = users;
            this.dataSource.paginator = this.paginator;
        });
    }

    openUserForm(user?: User) {
        const dialogRef = this.dialog.open(UserFormComponent, {
            width: '500px',
            data: user || null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadUsers();
            }
        });
    }

    deleteUser(user: User) {
        if (confirm(`Are you sure you want to deactivate ${user.fullName}?`)) {
            this.userService.deleteUser(user.id).subscribe(() => {
                this.loadUsers();
            });
        }
    }
}
