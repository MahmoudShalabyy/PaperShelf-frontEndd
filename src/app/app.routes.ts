import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { LoginFormComponent } from './auth/login-form/login-form.component';
import { RegisterFormComponent } from './auth/register-form/register-form.component';
import { ForgotPasswordFormComponent } from './auth/forgot-password-form/forgot-password-form.component';
import { OtpFormComponent } from './auth/otp-form/otp-form.component';
import { VerifyComponent } from './auth/verify/verify.component';
import { MainShopComponent } from './shop/main-shop/main-shop.component';
import { NotfoundComponent } from './shared/notfound/notfound.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { BookSliderComponent } from './book-slider/book-slider.component';
import { DashboardGuard } from './guards/admin.guard';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { NotFoundDashboardComponent } from './admin/not-found-dashboard/not-found-dashboard.component';
import { HomeDashboardComponent } from './admin/home-dashboard/home-dashboard.component';
import { ListUsersDashboardComponent } from './admin/users/list-users-dashboard/list-users-dashboard.component';
import { EditUserComponent } from './admin/users/edit-user/edit-user.component';
import { BooksDashboardComponent } from './admin/books-dashboard/books-dashboard.component';
import { ViewBookComponent } from './admin/books-dashboard/view-book/view-book.component';
import { EditBookComponent } from './admin/books-dashboard/edit-book/edit-book.component';
import { ApprovedComponent } from './admin/reviews/approved/approved.component';
import { PendingComponent } from './admin/reviews/pending/pending.component';
import { ProfileComponent } from './profile/profile.component';
import { OrderHistoryComponent } from './order-history/order-history.component';


import { AddBookComponent } from './author/add-book/add-book.component';
import { MyBooksComponent } from './author/my-books/my-books.component';
import { OrderComponent } from './order/order.component';
import { OrdersDashboardComponent } from './admin/orders-dashboard/orders-dashboard.component';
import { PendingBookComponent } from './admin/books-dashboard/pending-book/pending-book.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  {
    path: 'auth',
    component: AuthComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginFormComponent },
      { path: 'register', component: RegisterFormComponent },
      { path: 'forgot', component: ForgotPasswordFormComponent },
      { path: 'otp', component: OtpFormComponent },
      { path: 'verify', component: VerifyComponent },
    ],
  },

  { path: 'shop', component: MainShopComponent },
  { path: 'wishlist', component: WishlistComponent, canActivate: [AuthGuard] },
  { path: 'product/:id', component: ProductDetailsComponent },
  { path: 'home', component: HomeComponent },
  { path: 'book', component: BookSliderComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'orders', component: OrderHistoryComponent, canActivate: [AuthGuard] },


  { path: 'author/add-book', component: AddBookComponent, canActivate: [AuthGuard] },
  { path: 'author/my-books', component: MyBooksComponent, canActivate: [AuthGuard] },
  { path: 'author/edit-book/:id', component: AddBookComponent, canActivate: [AuthGuard] },
  { path: 'order', component: OrderComponent },


  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [DashboardGuard],
    children: [
      { path: '', component: ListUsersDashboardComponent },
      { path: 'users', component: ListUsersDashboardComponent },
      { path: 'users/edit/:id', component: EditUserComponent },
      { path: 'books', component: BooksDashboardComponent },
      { path: 'books/pending', component: PendingBookComponent },
      { path: 'books/view/:id', component: ViewBookComponent },
      { path: 'books/edit/:id', component: EditBookComponent },
      { path: 'reviews/approve', component: ApprovedComponent },
      { path: 'reviews/pending', component: PendingComponent },
      { path: 'orders', component: OrdersDashboardComponent },
      { path: '**', component: NotFoundDashboardComponent }
    ]
  },

  { path: '**', component: NotfoundComponent, canActivate: [AuthGuard] },
];
