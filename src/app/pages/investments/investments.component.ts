import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

interface InvestmentDTO {
  investmentId: number;
  userId: number;
  investmentType: string;
  amount: number;
  startDate: string;
  maturityDate: string;
  status: string;
}

interface InvestmentRequest {
  investmentType: string;
  amount: number;
  maturityDate: string;
}

@Component({
  standalone: true,
  selector: 'app-investments',
  templateUrl: './investments.component.html',
  styleUrls: ['./investments.component.css'],
  imports: [CommonModule, FormsModule]
})
export class InvestmentsComponent implements OnInit {
  role = '';
  investments: InvestmentDTO[] = [];
  error = '';
  createError = '';

  // Fields for creating an investment (CUSTOMER only)
  investmentType = 'FIXED_DEPOSIT';
  amount: number | null = null;
  maturityDate = '';

  marketData: any = null;
  interestKeys: string[] = [];
  trendKeys: string[] = [];

  private baseUrl = 'http://localhost:8091/api/investments';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.role = this.authService.getRole();

    // Load market trends initially
    this.loadMarketTrends();

    if (this.role === 'CUSTOMER') {
      this.loadUserInvestments();
    } else if (this.role === 'ADMIN') {
      this.loadAllInvestments();
    } else {
      this.error = 'Not authorized to view investments.';
    }
  }

  loadUserInvestments() {
    this.http.get<InvestmentDTO[]>(`${this.baseUrl}/me`).subscribe({
      next: (data) => {
        this.investments = data;
        this.error = '';
      },
      error: () => this.error = 'Failed to load your investments.'
    });
  }

  loadAllInvestments() {
    this.http.get<InvestmentDTO[]>(this.baseUrl).subscribe({
      next: (data) => {
        this.investments = data;
        this.error = '';
      },
      error: () => this.error = 'Failed to load all investments.'
    });
  }

  createInvestment() {
    if (!this.investmentType || !this.amount || !this.maturityDate) {
      this.createError = 'Please fill all required fields.';
      return;
    }

    const payload: InvestmentRequest = {
      investmentType: this.investmentType,
      amount: this.amount,
      maturityDate: this.maturityDate
    };

    this.http.post<InvestmentDTO>(this.baseUrl, payload).subscribe({
      next: () => {
        this.createError = '';
        // Clear form
        this.investmentType = 'FIXED_DEPOSIT';
        this.amount = null;
        this.maturityDate = '';
        // Refresh user investments
        this.loadUserInvestments();
      },
      error: () => this.createError = 'Failed to create investment.'
    });
  }

  loadMarketTrends() {
    this.http.get<any>(`${this.baseUrl}/market`).subscribe({
      next: (data) => {
        this.marketData = data;
        this.error = '';
        if (data.interestRates) {
          this.interestKeys = Object.keys(data.interestRates);
        }
        if (data.marketTrends) {
          this.trendKeys = Object.keys(data.marketTrends);
        }
      },
      error: () => {
        // Not critical if fails
      }
    });
  }
}
