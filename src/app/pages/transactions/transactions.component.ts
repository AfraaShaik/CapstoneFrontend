import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService, TransactionDTO } from '../../core/services/transaction.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service'; 

@Component({
  standalone: true,
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  imports: [CommonModule, FormsModule]
})
export class TransactionsComponent implements OnInit {
  transactions: TransactionDTO[] = [];
  error: string = '';
  role: string = '';
  userAccounts: any[] = [];
  selectedAccountId: number | null = null;

  // Fields for transfer
  transferFromAccount: number | null = null;
  transferToAccount: number | null = null;
  transferAmount: number | null = null;
  transferType: string = 'NEFT';
  transferError: string = '';
  transferSuccess: string = '';

  private accountsUrl = 'http://localhost:8091/api/accounts';
  private transferUrl = 'http://localhost:8091/api/transactions/transfer';

  constructor(
    private transactionService: TransactionService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getRole();

    if (this.role === 'CUSTOMER') {
      this.loadUserAccounts();
    }
    // If ADMIN, will wait for admin to input accountId
  }

  loadUserAccounts() {
    this.http.get<any[]>(this.accountsUrl).subscribe({
      next: (data) => {
        this.userAccounts = data;
        this.error = '';
        if (this.userAccounts.length > 0) {
          // select first account by default
          this.selectedAccountId = this.userAccounts[0].id;
          this.fetchTransactions();
        }
      },
      error: () => this.error = 'Failed to load user accounts.'
    });
  }

  fetchTransactions() {
    if (!this.selectedAccountId) {
      this.error = 'Please select or enter a valid account ID.';
      return;
    }

    this.transactionService.getTransactionHistory(this.selectedAccountId).subscribe({
      next: (data: TransactionDTO[]) => {
        this.transactions = data;
        this.error = '';
      },
      error: () => {
        this.transactions = [];
        this.error = 'Failed to load transactions.';
      }
    });
  }

  performTransfer() {
    if (!this.transferFromAccount || !this.transferToAccount || !this.transferAmount || this.transferAmount <= 0) {
      this.transferError = 'Please provide valid transfer details.';
      this.transferSuccess = '';
      return;
    }

    const payload = {
      fromAccount: this.transferFromAccount,
      toAccount: this.transferToAccount,
      amount: this.transferAmount,
      type: this.transferType
    };

    this.http.post<any>(this.transferUrl, payload).subscribe({
      next: (result) => {
        this.transferError = '';
        this.transferSuccess = `Transfer successful. Transaction ID: ${result.transactionId}`;
        // After successful transfer, refresh transaction list if the selectedAccountId matches fromAcc or toAcc
        if (this.selectedAccountId && (this.selectedAccountId === this.transferFromAccount || this.selectedAccountId === this.transferToAccount)) {
          this.fetchTransactions();
        }
        // Clear form fields
        this.transferFromAccount = null;
        this.transferToAccount = null;
        this.transferAmount = null;
        this.transferType = 'NEFT';
      },
      error: (err) => {
        this.transferSuccess = '';
        this.transferError = err.error?.message || 'Transfer failed.';
      }
    });
  }
}
