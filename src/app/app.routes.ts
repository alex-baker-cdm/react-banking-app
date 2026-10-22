import { Routes } from '@angular/router';

import { AccountDetail } from './pages/account-detail/account-detail';
import { Accounts } from './pages/accounts/accounts';
import { Signin } from './pages/signin/signin';
import { Transfer } from './pages/transfer/transfer';

export const routes: Routes = [
  { path: '', component: Signin, pathMatch: 'full' },
  { path: 'accounts', component: Accounts },
  { path: 'accounts/:id', component: AccountDetail },
  { path: 'transfer', component: Transfer },
  { path: '**', redirectTo: '' },
];
