import { Component, OnInit } from '@angular/core';
import { UseRandomUser } from '@core/usecases';
import { RandomUserEntity } from '@core/entities';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  standalone: false,
})
export class ListComponent implements OnInit {
  users: RandomUserEntity[] = [];
  isLoading = true;

  private readonly _useRandomUser = new UseRandomUser();

  ngOnInit() {
    this._useRandomUser.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  userClicked() {
    console.log('User clicked');
    // You can implement Bootstrap toast notifications here if needed
    // Example: Show a Bootstrap toast using native Bootstrap JS
  }
}
