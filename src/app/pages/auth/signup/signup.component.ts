import { Component } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule ,FormsModule,RouterModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  email = '';
  password = '';
  fullName = '';
  error = '';
  message = '';

  constructor(private authService: AuthService, private router: Router){}

  signup() {
    this.authService.signup({email: this.email, password: this.password, fullName: this.fullName}).subscribe({
      next: () => {
        this.message = 'User registered successfully. Please login.';
        this.router.navigate(['/login']);
      },
      error: err => this.error = 'Error registering user.'
    });
  }
}
