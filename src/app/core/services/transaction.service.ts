import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TransactionDTO {
  transactionId: number;
  fromAccount: number;
  toAccount: number;
  amount: number;
  type: string;
  status: string;
  timestamp: string; // ISO date string
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private baseUrl = 'http://localhost:8091/api/transactions';

  constructor(private http: HttpClient) {}

  getTransactionHistory(accountId: number): Observable<TransactionDTO[]> {
    return this.http.get<TransactionDTO[]>(`${this.baseUrl}/history/${accountId}`);
  }
}
