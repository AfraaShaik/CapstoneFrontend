import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

interface ReportDTO {
  reportId: number;
  type: string;
  generatedDate: string;
  data: string;
  createdBy: number;
}

interface GenerateReportRequest {
  type: string;
}

@Component({
  standalone: true,
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ReportsComponent implements OnInit {
  reports: ReportDTO[] = [];
  error = '';
  generateError = '';
  
  role = '';
  selectedReportType = 'TRANSACTION_SUMMARY';
  filterType = '';

  private baseUrl = 'http://localhost:8091/api/reports';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.role = this.authService.getRole();
    if (this.role !== 'ADMIN') {
      this.error = 'Not authorized to view reports.';
      return;
    }

    this.loadAllReports();
  }

  loadAllReports() {
    this.http.get<ReportDTO[]>(this.baseUrl).subscribe({
      next: (data) => {
        this.reports = data;
        this.error = '';
      },
      error: () => this.error = 'Failed to load reports.'
    });
  }

  generateReport() {
    const payload: GenerateReportRequest = { type: this.selectedReportType };
    this.http.post<ReportDTO>(`${this.baseUrl}/generate`, payload).subscribe({
      next: (report) => {
        this.generateError = '';
        // After generating a report, reload all or filter again
        this.loadAllReports();
      },
      error: () => this.generateError = 'Failed to generate report.'
    });
  }

  filterReports() {
    if (!this.filterType) {
      // No filter: load all reports
      this.loadAllReports();
      return;
    }

    this.http.get<ReportDTO[]>(`${this.baseUrl}/type/${this.filterType}`).subscribe({
      next: (data) => {
        this.reports = data;
        this.error = '';
      },
      error: () => this.error = 'Failed to filter reports.'
    });
  }
}
