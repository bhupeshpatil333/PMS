import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.interface';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { UserFormComponent } from '../user-form/user-form.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { UserStatusEnum } from '../../../core/enums/user.enum';

@Component({
  selector: 'app-user-list',
  imports: [SharedMaterialModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<User>([]);
  displayedColumns: string[] = ['fullName', 'email', 'role', 'status', 'actions'];
  activeFilter: UserStatusEnum | 'All' = 'All';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private userService: UserService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe(users => {
      this.filterUsers(users);
    });
  }

  filterUsers(users: User[]) {
    let filteredUsers = users;

    if (this.activeFilter === UserStatusEnum.Active) {
      filteredUsers = users.filter(user => user.isActive !== false);
    } else if (this.activeFilter === UserStatusEnum.Inactive) {
      filteredUsers = users.filter(user => user.isActive === false);
    }

    this.dataSource.data = filteredUsers;
  }

  onFilterChange(event: MatButtonToggleChange) {
    this.activeFilter = event.value;
    this.loadUsers();
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
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Deactivate User?',
        message: `Are you sure you want to deactivate ${user.fullName}?`,
        confirmText: 'Yes, Deactivate',
        cancelText: 'Cancel',
        type: 'delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(user.id).subscribe(() => {
          this.loadUsers();
        });
      }
    });
  }
}
