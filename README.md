
# 📚 PaperShelf - Modern Online Bookstore

  

<div  align="center">

<img  src="https://img.shields.io/badge/Angular-17-red?style=for-the-badge&logo=angular"  alt="Angular 17">

<img  src="https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript"  alt="TypeScript">

<img  src="https://img.shields.io/badge/Bootstrap-5.3-purple?style=for-the-badge&logo=bootstrap"  alt="Bootstrap">

<img  src="https://img.shields.io/badge/Status-Active-green?style=for-the-badge"  alt="Status">

</div>

  

## 🌟 About PaperShelf

  

PaperShelf is a comprehensive, modern online bookstore built with Angular 17. It provides a complete e-commerce solution for book lovers, authors, and administrators with an intuitive interface and powerful features.

  

### ✨ Key Highlights

  

- 🎯 **Multi-Role System**: Admin, Author, and User roles with distinct capabilities

- 🔐 **Advanced Authentication**: JWT-based auth with Google OAuth integration

- 📱 **Responsive Design**: Seamless experience across all devices

- 🛒 **Complete E-commerce**: Cart, wishlist, orders, and payment integration

- 📝 **Review System**: User reviews with moderation capabilities

- 🔍 **Advanced Search**: Smart filtering and sorting options

- 📊 **Admin Dashboard**: Comprehensive management interface

  

## 🚀 Features

  

### 👥 User Management

-  **Multi-Role Authentication**: Admin, Author, and User accounts

-  **Secure Registration**: Email verification with OTP

-  **Google OAuth**: Quick social login integration

-  **Password Recovery**: Secure reset with OTP verification

-  **Profile Management**: User profiles with order history

  

### 📖 Book Management

-  **Dynamic Catalog**: Comprehensive book listing with categories

-  **Author Portal**: Authors can add, edit, and manage their books

-  **Approval System**: Admin approval for new books and changes

-  **Rich Media**: Multiple book images and detailed descriptions

-  **Inventory Tracking**: Real-time stock management

  

### 🛍️ E-commerce Features

-  **Shopping Cart**: Add, remove, and modify book quantities

-  **Wishlist**: Save books for later purchase

-  **Advanced Search**: Filter by category, price, rating, and more

-  **Smart Sorting**: Multiple sorting options (price, rating, newest)

-  **Order Management**: Complete order tracking and history

  

### 📊 Admin Dashboard

-  **User Management**: View, edit, and manage all users

-  **Book Moderation**: Approve/reject book submissions

-  **Review Management**: Moderate user reviews

-  **Order Tracking**: Monitor all orders and transactions

-  **Analytics**: Comprehensive system insights

  

### 🎨 User Experience

-  **Modern UI**: Clean, professional design with Bootstrap 5

-  **Responsive Layout**: Perfect on desktop, tablet, and mobile

-  **Infinite Scroll**: Smooth browsing experience

-  **Toast Notifications**: Real-time feedback for user actions

-  **Loading States**: Smooth loading indicators

  

## 🛠️ Tech Stack

  

### Frontend

-  **Angular 17**: Latest Angular with standalone components

-  **TypeScript 5.4**: Type-safe development

-  **Bootstrap 5.3**: Responsive UI framework

-  **Font Awesome**: Comprehensive icon library

-  **RxJS**: Reactive programming for async operations

  

### Key Dependencies

-  **NGX Toastr**: Toast notifications

-  **NGX Infinite Scroll**: Infinite scrolling functionality

-  **Angular Forms**: Reactive forms with validation

-  **Angular Router**: Client-side routing with guards

-  **Angular HTTP Client**: API communication

  

### Development Tools

-  **Angular CLI**: Development and build tools

-  **Jasmine & Karma**: Testing framework

-  **TypeScript Compiler**: Type checking and compilation

  

## 🏗️ Project Structure

  

```

src/

├── app/

│ ├── admin/ # Admin dashboard components

│ │ ├── dashboard/ # Main dashboard

│ │ ├── books-dashboard/ # Book management

│ │ ├── users/ # User management

│ │ └── reviews/ # Review moderation

│ ├── auth/ # Authentication components

│ │ ├── login-form/ # User login

│ │ ├── register-form/ # User registration

│ │ └── forgot-password/ # Password recovery

│ ├── author/ # Author-specific features

│ │ ├── add-book/ # Book creation/editing

│ │ └── my-books/ # Author's book management

│ ├── shop/ # Shopping experience

│ │ ├── main-shop/ # Book browsing

│ │ └── filter/ # Search and filter

│ ├── services/ # Business logic services

│ ├── guards/ # Route protection

│ ├── interceptors/ # HTTP interceptors

│ └── interfaces/ # TypeScript interfaces

├── assets/ # Static assets

└── environments/ # Environment configurations

```

  

## ⚙️ Installation & Setup

  

### Prerequisites

- Node.js (v18 or higher)

- npm or yarn

- Angular CLI (`npm install -g @angular/cli`)

  

### Installation Steps

  

1.  **Clone the repository**

```bash

git clone https://github.com/your-username/PaperShelf-frontEnd.git

cd PaperShelf-frontEnd

```

  

2.  **Install dependencies**

```bash

npm install

```

  

3.  **Environment Configuration**

Update `src/environments/environment.ts`:

```typescript

export  const  environment  = {

production: false,

apiBase:  'http://localhost:3000/api',

apiBaseUrl:  'http://localhost:3000/api/v1',

apiUrlForImgs:  'http://localhost:3000/',

googleClientId:  'your-google-client-id'

};

```

  

4.  **Start the development server**

```bash

ng serve

```

  

5.  **Open your browser**

Navigate to `http://localhost:4200`

  

## 🎯 Usage Guide

  

### For Regular Users

1.  **Register/Login**: Create an account or sign in with Google

2.  **Browse Books**: Explore the catalog with search and filters

3.  **Add to Cart**: Select books and quantities

4.  **Wishlist**: Save books for later

5.  **Purchase**: Complete orders and track history

6.  **Review**: Rate and review purchased books

  

### For Authors

1.  **Author Registration**: Register with "Author" role

2.  **Add Books**: Create new book listings

3.  **Manage Inventory**: Update stock and pricing

4.  **Track Sales**: Monitor book performance

5.  **Edit Content**: Update book details and descriptions

  

### For Administrators

1.  **Admin Dashboard**: Access comprehensive management panel

2.  **User Management**: View and manage all users

3.  **Book Moderation**: Approve or reject book submissions

4.  **Review Management**: Moderate user reviews

5.  **Order Tracking**: Monitor all transactions

  

## 🔧 Available Scripts

  

```bash

# Development server

ng  serve

  

# Build for production

ng  build

  

# Run tests

ng  test

  

# Watch mode for development

ng  build  --watch  --configuration  development

  

# Linting

ng  lint

```

  

## 🔐 Authentication & Security

  

### Authentication Flow

1.  **Registration**: Email verification with OTP

2.  **Login**: JWT token with refresh token

3.  **Google OAuth**: Social login integration

4.  **Password Reset**: Secure OTP-based recovery

  

### Security Features

-  **JWT Authentication**: Secure token-based authentication

-  **Route Guards**: Role-based access control

-  **HTTP Interceptors**: Automatic token handling

-  **Input Validation**: Comprehensive form validation

-  **XSS Protection**: Sanitized user inputs

  

## 📱 Responsive Design

  

PaperShelf is fully responsive and optimized for:

-  **Desktop**: Full-featured experience

-  **Tablet**: Optimized layout and navigation

-  **Mobile**: Touch-friendly interface

  

## 🚀 Deployment

  

### Production Build

```bash

ng  build  --configuration  production

```

  

### Environment Setup

Configure production environment in `src/environments/environment.prod.ts`:

```typescript

export  const  environment  = {

production: true,

apiBase:  'https://your-api-domain.com/api',

apiBaseUrl:  'https://your-api-domain.com/api/v1',

apiUrlForImgs:  'https://your-api-domain.com/',

googleClientId:  'your-production-google-client-id'

};

```

  

## 🤝 Contributing

  

We welcome contributions! Please follow these steps:

  

1. Fork the repository

2. Create a feature branch (`git checkout -b feature/amazing-feature`)

3. Commit your changes (`git commit -m 'Add amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)

5. Open a Pull Request

  

### Code Style

- Follow Angular style guide

- Use TypeScript strict mode

- Write meaningful commit messages

- Include proper documentation

  

## 📋 API Integration

  
PaperShelf integrates with a REST API backend. Key endpoints:


-  **Authentication**: `/api/v1/auth/*`

-  **Books**: `/api/v1/books/*`

-  **Users**: `/api/v1/users/*`

-  **Orders**: `/api/v1/orders/*`

-  **Reviews**: `/api/v1/reviews/*`

-  **Wishlist**: `/api/v1/wishlist/*`

  

## 🐛 Known Issues & Solutions

  

### Common Issues

1.  **CORS Errors**: Ensure backend CORS is configured

2.  **Token Expiration**: Implemented automatic refresh

3.  **Image Loading**: Proper fallback images included

  

### Troubleshooting

- Check browser console for errors

- Verify API endpoints are accessible

- Ensure proper environment configuration

  

## 🔄 Updates & Roadmap

  

### Recent Updates

- ✅ Angular 17 upgrade with standalone components

- ✅ Enhanced authentication with Google OAuth

- ✅ Improved responsive design

- ✅ Advanced search and filtering

  

### Future Enhancements

- 🔄 Advanced analytics dashboard

- 🔄 Mobile app version

- 🔄 Multi-language support

  

## 📞 Support

  

For support and questions:

-  **Issues**: [GitHub Issues](https://github.com/KareemA-Saad/PaperShelf-frontEnd/issues)

-  **Discussions**: [GitHub Discussions](https://github.com/KareemA-Saad/PaperShelf-frontEnd/discussions)

-  **Email**: itiprojects7@gmail.com

  

## 📄 License

  

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

  

## 🙏 Acknowledgments

  

- Angular team for the amazing framework

- Bootstrap for the UI components

- Font Awesome for the icons

- All contributors and testers

  

---

  

<div  align="center">

<strong>Built with ❤️ using Angular 17</strong>

<br>

<sub>PaperShelf - Where Stories Come to Life</sub>

</div>
