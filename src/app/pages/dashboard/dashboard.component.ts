import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule,RouterModule]
})
export class DashboardComponent implements OnInit {
  username = '';
  role='';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.username = this.authService.getUsername();
    this.role = this.authService.getRole();
  }
}
