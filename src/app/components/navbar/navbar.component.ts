import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
interface NotificationDTO {
  notificationId: number;
  userId: number;
  type: string;
  message: string;
  timestamp: string;
  status: string;
}

interface Preference {
  key: string;
  enabled: boolean;
}

@Component({
  standalone: true,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule,FormsModule,RouterModule]
})
export class NavbarComponent {
  showNotifications = false;
  showPreferences = false;
  notifications: NotificationDTO[] = [];
  notificationTypes: Preference[] = [
    { key: 'ACCOUNT_ACTIVITY', enabled: true },
    { key: 'LOAN_UPDATE', enabled: true },
    { key: 'CARD_ACTIVITY', enabled: true }
    // Add more types if needed
  ];
  filterStatus = '';
  unreadCount = 0;
  error = '';

  private baseUrl = 'http://localhost:8091/api/notifications';

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit() {
    if (this.isLoggedIn()) {
      this.loadNotifications();
      this.loadPreferences();
    }
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  isAdmin() {
    return this.authService.getRole() === 'ADMIN';
  }

  logout() {
    this.authService.logout();
    location.reload();
  }

  toggleNotifications() {
    if (!this.showNotifications) {
      this.showPreferences = false;
      this.loadNotifications();
    }
    this.showNotifications = !this.showNotifications;
  }

  loadNotifications() {
    if (!this.isLoggedIn()) return;

    let url = this.baseUrl;
    if (this.filterStatus) {
      url += `?status=${this.filterStatus}`;
    }

    this.http.get<NotificationDTO[]>(url).subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.filter(n => n.status === 'UNREAD').length;
        this.error = '';
      },
      error: () => this.error = 'Failed to load notifications.'
    });
  }

  markAsRead(notificationId: number) {
    this.http.put<NotificationDTO>(`${this.baseUrl}/${notificationId}/read`, {}).subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: () => this.error = 'Failed to mark as read.'
    });
  }

  deleteNotification(notificationId: number) {
    this.http.delete(`${this.baseUrl}/${notificationId}`).subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: () => this.error = 'Failed to delete notification.'
    });
  }

  togglePreferences() {
    this.showPreferences = !this.showPreferences;
  }

  loadPreferences() {
    // If the backend had an endpoint to get current preferences, we would load them here.
    // For now, we assume defaults or store them locally.
    // If there's no endpoint, consider building one. 
    // We'll simulate by just leaving them as they are.
  }

  updatePrefFromEvent(type: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const enabled = input.checked;
    this.updatePreference(type, enabled);
  }
  updatePreference(type: string, enabled: boolean) {
    this.http.post(`${this.baseUrl}/preferences?type=${type}&enabled=${enabled}`, {})
    .subscribe({
      next: () => {
        // Update local state
        const pref = this.notificationTypes.find(p => p.key === type);
        if (pref) pref.enabled = enabled;
      },
      error: () => this.error = 'Failed to update preference.'
    });
  }
  
  
}
