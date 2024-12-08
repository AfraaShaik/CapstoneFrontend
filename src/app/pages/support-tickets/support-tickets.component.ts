import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

interface SupportTicketDTO {
  ticketId: number;
  userId: number;
  category: string;
  message: string;
  status: string;
  createdDate: string;
  resolvedDate: string | null;
}

interface SupportTicketRequest {
  category: string;
  message: string;
}

@Component({
  standalone: true,
  selector: 'app-support-tickets',
  templateUrl: './support-tickets.component.html',
  styleUrls: ['./support-tickets.component.css'],
  imports: [CommonModule, FormsModule]
})
export class SupportTicketsComponent implements OnInit {
  role = '';
  userId: number | null = null;
  tickets: SupportTicketDTO[] = [];
  faq: string[] = [];
  error = '';
  createError = '';

  category = '';
  message = '';

  private baseUrl = 'http://localhost:8091/api/support/tickets';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.role = this.authService.getRole();

    // Fetch FAQ (for both ADMIN and CUSTOMER)
    this.loadFaq();

    if (this.role === 'CUSTOMER') {
      // Decode userId from token
      const token = this.authService.getToken();
      if(token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userId = payload.userId || null;
      }

      if(!this.userId) {
        this.error = 'User ID not found in token.';
        return;
      }

      this.loadUserTickets(this.userId);
    } else if (this.role === 'ADMIN') {
      this.loadAllTickets();
    } else {
      this.error = 'Not authorized to view support tickets.';
    }
  }

  loadFaq() {
    this.http.get<string[]>(`${this.baseUrl}/faq`).subscribe({
      next: (data) => {
        this.faq = data;
      },
      error: () => {
        // It's not critical if FAQ fails, we can just ignore error here or show a message
      }
    });
  }

  loadUserTickets(userId: number) {
    this.http.get<SupportTicketDTO[]>(`${this.baseUrl}/user/${userId}`).subscribe({
      next: (data) => {
        this.tickets = data;
        this.error = '';
      },
      error: () => this.error = 'Failed to load tickets.'
    });
  }

  loadAllTickets() {
    this.http.get<SupportTicketDTO[]>(this.baseUrl).subscribe({
      next: (data) => {
        this.tickets = data;
        this.error = '';
      },
      error: () => this.error = 'Failed to load all tickets.'
    });
  }

  createTicket() {
    if(!this.category || !this.message) {
      this.createError = 'Please fill all required fields (category, message).';
      return;
    }

    const payload: SupportTicketRequest = {
      category: this.category,
      message: this.message
    };

    this.http.post<SupportTicketDTO>(this.baseUrl, payload).subscribe({
      next: (ticket) => {
        this.createError = '';
        // Clear form
        this.category = '';
        this.message = '';
        // Refresh user tickets
        if (this.userId) this.loadUserTickets(this.userId);
      },
      error: () => this.createError = 'Failed to create ticket.'
    });
  }

  resolveTicket(ticketId: number) {
    this.http.put<SupportTicketDTO>(`${this.baseUrl}/${ticketId}/resolve`, {}).subscribe({
      next: () => {
        // Refresh admin view
        this.loadAllTickets();
      },
      error: () => this.error = 'Failed to resolve ticket.'
    });
  }
}
