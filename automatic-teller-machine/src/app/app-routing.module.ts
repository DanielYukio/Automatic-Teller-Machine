import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './_guards/auth.guard';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
// import { TransactionComponent } from './components/transaction/transaction.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    loadChildren: () => import('../app/components/dashboard/dashboard.module').then(m => m.DashboardModule),
  },
  // {
  //   path: 'transaction',
  //   component: TransactionComponent,
  //   loadChildren: () => import('../app/components/transaction/transaction.module').then(m => m.TransactionModule),
  // },

  //redirecionamentos
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
