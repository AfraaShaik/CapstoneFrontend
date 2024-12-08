// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AccountsComponent } from './pages/accounts/accounts.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { LoansComponent } from './pages/loans/loans.component';
import { CardsComponent } from './pages/cards/cards.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { SupportTicketsComponent } from './pages/support-tickets/support-tickets.component';
import { InvestmentsComponent } from './pages/investments/investments.component';
import { AuthGuard } from './core/guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'accounts', component: AccountsComponent, canActivate: [AuthGuard] },
  { path: 'transactions', component: TransactionsComponent, canActivate: [AuthGuard] },
  { path: 'loans', component: LoansComponent, canActivate: [AuthGuard] },
  { path: 'cards', component: CardsComponent , canActivate: [AuthGuard]},
  { path: 'reports', component: ReportsComponent } ,
  { path: 'support-tickets', component: SupportTicketsComponent } ,
  { path: 'investments', component: InvestmentsComponent,canActivate: [AuthGuard] }
];
