// login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, FormsModule,RouterModule ]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router){}

  login() {
    this.authService.login({email: this.email, password: this.password}).subscribe({
      next: (res:any) => {
        this.authService.setToken(res.token);
        this.router.navigate(['/dashboard']);
      },
      error: err => this.error = 'Invalid credentials'
    });
  }
}
