import { Routes } from '@angular/router';
import { SigninComponent } from './pages/signin/signin.component';
import { HomeComponent } from './pages/home/home.component';
import { CardsComponent } from './pages/cards/cards.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SavingsComponent } from './pages/savings/savings.component';
import { SendMoneyComponent } from './pages/send-money/send-money.component';
import { AddComponent } from './pages/add/add.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';

export const routes: Routes = [
  { path: '', component: SigninComponent },
  { path: 'home', component: HomeComponent },
  { path: 'add', component: AddComponent },
  { path: 'cards', component: CardsComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'savings', component: SavingsComponent },
  { path: 'send', component: SendMoneyComponent },
  { path: 'transactions', component: TransactionsComponent },
];
