import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

interface CardDTO {
  cardId: number;
  userId: number;
  cardType: string;
  cardNumber: string;
  expiryDate: string;
  status: string;
}

@Component({
  standalone: true,
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css'],
  imports: [CommonModule, FormsModule]
})
export class CardsComponent implements OnInit {
  cards: CardDTO[] = [];
  error = '';
  applyError = '';
  
  role = '';
  userId: number | null = null;

  // Fields for applyForCard
  cardType = '';

  // Fields for replacing card
  replaceCardId: number | null = null;
  replaceCardType = '';

  private baseUrl = 'http://localhost:8091/api/cards';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.role = this.authService.getRole();
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

      this.loadUserCards();
    } else if (this.role === 'ADMIN') {
      this.loadAllCards();
    }
  }

  loadUserCards() {
    this.http.get<CardDTO[]>(`${this.baseUrl}/me`).subscribe({
      next: (data) => {
        this.cards = data;
        this.error = '';
      },
      error: () => this.error = 'Failed to load your cards.'
    });
  }

  loadAllCards() {
    this.http.get<CardDTO[]>(this.baseUrl).subscribe({
      next: (data) => {
        this.cards = data;
        this.error = '';
      },
      error: () => this.error = 'Failed to load all cards.'
    });
  }

  applyForCard() {
    if(!this.cardType) {
      this.applyError = 'Please select a card type.';
      return;
    }

    const payload = {
      cardType: this.cardType
    };

    this.http.post<CardDTO>(this.baseUrl, payload).subscribe({
      next: (newCard) => {
        this.applyError = '';
        // Clear form
        this.cardType = '';
        // Refresh cards
        this.loadUserCards();
      },
      error: () => this.applyError = 'Failed to apply for card.'
    });
  }

  blockCard(cardId: number) {
    this.http.put<CardDTO>(`${this.baseUrl}/${cardId}/block`, {}).subscribe({
      next: () => this.loadUserCards(),
      error: () => this.error = 'Failed to block card.'
    });
  }

  reportLost(cardId: number) {
    this.http.put<CardDTO>(`${this.baseUrl}/${cardId}/lost`, {}).subscribe({
      next: () => this.loadUserCards(),
      error: () => this.error = 'Failed to report card lost.'
    });
  }

  startReplace(cardId: number) {
    this.replaceCardId = cardId;
    // Clear replacement fields
    this.replaceCardType = '';
  }

  replaceCard(cardId: number) {
    if(!this.replaceCardType) {
      this.error = 'Please select a new card type.';
      return;
    }

    const payload = {
      cardType: this.replaceCardType
    };

    this.http.post<CardDTO>(`${this.baseUrl}/${cardId}/replace`, payload).subscribe({
      next: () => {
        this.replaceCardId = null;
        this.error = '';
        this.loadUserCards();
      },
      error: () => this.error = 'Failed to replace card.'
    });
  }

  // ADMIN actions
  approveCard(cardId: number) {
    this.http.put<CardDTO>(`${this.baseUrl}/${cardId}/approve`, {}).subscribe({
      next: () => this.loadAllCards(),
      error: () => this.error = 'Failed to approve card.'
    });
  }

  rejectCard(cardId: number) {
    this.http.put<CardDTO>(`${this.baseUrl}/${cardId}/reject`, {}).subscribe({
      next: () => this.loadAllCards(),
      error: () => this.error = 'Failed to reject card.'
    });
  }
}
