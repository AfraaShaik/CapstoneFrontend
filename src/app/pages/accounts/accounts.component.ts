import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  accounts: any[] = [];
  error = '';

  // Fields for creating a new account
  newAccountType = '';
  newAccountBalance: number | null = null;
  createError = '';

  // Field for deposit/withdraw operations
  transactionAmount: number | null = null;

  private baseUrl = 'http://localhost:8091/api/accounts';

  constructor(private http: HttpClient){}

  ngOnInit(){
    this.loadAccounts();
  }

  loadAccounts() {
    this.http.get<any[]>(this.baseUrl).subscribe({
      next: (data) => {
        this.accounts = data;
        this.error = '';
      },
      error: err => this.error = 'Failed to load accounts'
    });
  }

  createAccount() {
    if (!this.newAccountType || this.newAccountBalance == null) {
      this.createError = 'Please provide account type and balance.';
      return;
    }

    const payload = {
      accountType: this.newAccountType,
      balance: this.newAccountBalance,
      status: 'ACTIVE' // defaulting to ACTIVE for now
    };

    this.http.post<any>(this.baseUrl, payload).subscribe({
      next: () => {
        this.createError = '';
        this.newAccountType = '';
        this.newAccountBalance = null;
        this.loadAccounts();
      },
      error: () => this.createError = 'Failed to create account.'
    });
  }

  deposit(accountId: number) {
    if (this.transactionAmount == null || this.transactionAmount <= 0) {
      this.error = 'Please enter a valid amount to deposit.';
      return;
    }

    const payload = { amount: this.transactionAmount };
    this.http.put<any>(`${this.baseUrl}/${accountId}/deposit`, payload).subscribe({
      next: () => {
        this.error = '';
        this.transactionAmount = null;
        this.loadAccounts();
      },
      error: () => this.error = 'Failed to deposit.'
    });
  }

  withdraw(accountId: number) {
    if (this.transactionAmount == null || this.transactionAmount <= 0) {
      this.error = 'Please enter a valid amount to withdraw.';
      return;
    }

    const payload = { amount: this.transactionAmount };
    this.http.put<any>(`${this.baseUrl}/${accountId}/withdraw`, payload).subscribe({
      next: () => {
        this.error = '';
        this.transactionAmount = null;
        this.loadAccounts();
      },
      error: () => this.error = 'Failed to withdraw.'
    });
  }

  deleteAccount(accountId: number) {
    this.http.delete(`${this.baseUrl}/${accountId}`, { responseType: 'text' }).subscribe({
      next: () => {
        this.error = '';
        this.loadAccounts();
      },
      error: () => this.error = 'Failed to delete account.'
    });
  }
}
