import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

interface LoanDTO {
  loanId: number;
  userId: number;
  loanType: string;
  amount: number;
  interestRate: number;
  tenure: number;
  status: string;
  appliedDate: string;
  approvedDate: string;
  documentUrl: string;
}

@Component({
  standalone: true,
  selector: 'app-loans',
  templateUrl: './loans.component.html',
  styleUrls: ['./loans.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoansComponent implements OnInit {
  loans: LoanDTO[] = [];
  error = '';
  applyError = '';
  
  role = '';
  userId: number | null = null; // If needed to store userId for CUSTOMER

  // Fields for loan application (CUSTOMER only)
  loanType = '';
  loanAmount: number | null = null;
  interestRate: number | null = null;
  tenure: number | null = null;
  documentUrl = '';

  private baseUrl = 'http://localhost:8091/api/loans';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.role = this.authService.getRole(); // Make sure getRole() is implemented and returns "ADMIN" or "CUSTOMER"

    if (this.role === 'CUSTOMER') {
      const uid = this.authService.getUserId();
      if (!uid) {
        this.error = 'User ID not found in token.';
        return;
      }
      this.userId = uid;
      this.loadUserLoans(this.userId);
  
    } else if (this.role === 'ADMIN') {
      this.loadAllLoans();
    }
  }

  loadUserLoans(userId: number) {
    this.http.get<LoanDTO[]>(`${this.baseUrl}/user/${userId}`).subscribe({
      next: (data) => {
        this.loans = data;
        this.error = '';
      },
      error: () => this.error = 'Failed to load user loans.'
    });
  }

  loadAllLoans() {
    this.http.get<LoanDTO[]>(this.baseUrl).subscribe({
      next: (data) => {
        this.loans = data;
        this.error = '';
      },
      error: () => this.error = 'Failed to load all loans.'
    });
  }

  applyForLoan() {
    if(!this.loanType || !this.loanAmount || !this.interestRate || !this.tenure) {
      this.applyError = 'Please fill all required fields.';
      return;
    }

    const payload = {
      loanType: this.loanType,
      amount: this.loanAmount,
      interestRate: this.interestRate,
      tenure: this.tenure,
      documentUrl: this.documentUrl
    };

    this.http.post<LoanDTO>(`${this.baseUrl}/apply`, payload).subscribe({
      next: (loan) => {
        this.applyError = '';
        // Clear form
        this.loanType = '';
        this.loanAmount = null;
        this.interestRate = null;
        this.tenure = null;
        this.documentUrl = '';

        // Refresh user loans
        if(this.userId) {
          this.loadUserLoans(this.userId);
        }
      },
      error: () => this.applyError = 'Failed to apply for loan.'
    });
  }

  approveLoan(loanId: number) {
    this.http.put<LoanDTO>(`${this.baseUrl}/${loanId}/approve`, {}).subscribe({
      next: () => {
        // Refresh admin view
        this.loadAllLoans();
      },
      error: () => this.error = 'Failed to approve loan.'
    });
  }

  rejectLoan(loanId: number) {
    this.http.put<LoanDTO>(`${this.baseUrl}/${loanId}/reject`, {}).subscribe({
      next: () => {
        // Refresh admin view
        this.loadAllLoans();
      },
      error: () => this.error = 'Failed to reject loan.'
    });
  }
}
