import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { map, of } from 'rxjs';

export const unsavedChangesGuard: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {
  const dialog = inject(MatDialog);

  // Check for any open dialogs that might have dirty forms
  if (dialog.openDialogs.length > 0) {
    const dialogRef = dialog.openDialogs[0];
    const instance = dialogRef.componentInstance as any;

    // Check if the component instance has a form and if it's dirty
    if (instance && instance.form && instance.form.dirty) {
      // Create a dedicated dialog ref for the confirmation dialog
      const confirmDialogRef = dialog.open(ConfirmationDialogComponent, {
        data: {
          title: 'Discard Changes',
          message: 'You have unsaved changes. Do you want to leave this page?',
          confirmText: 'Leave',
          cancelText: 'Stay',
          type: 'discard'
        }
      });

      return confirmDialogRef.afterClosed().pipe(
        map(result => {
          if (result) {
            // If user confirms leaving, close the original dirty dialog too
            dialogRef.close();
            return true;
          }
          return false;
        })
      );
    }
  }

  return true;
};
