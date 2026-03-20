# Wallet App Documentation

## Overview

A comprehensive personal finance tracking application designed for managing income and expenses in Nepalese Rupees (NPR). The app combines traditional manual entry with AI-powered assistance for efficient financial management.

## Tech Stack

### Frontend

- React Native with TypeScript
- Expo Framework
- Expo Router for navigation
- React Native Paper for UI components

### Backend

- Supabase for database and authentication
- RESTful API endpoints

### AI Integration

- DeepSeek for natural language processing
- AI-assisted transaction entry

## Core Features

### 1. Authentication System

- Email-based authentication
- Secure signup/login flow
- Session persistence
- Password recovery

### 2. Financial Management

#### Transaction Handling

- Balance tracking in NPR
- Expense recording with:
  - Amount
  - Description
  - Date and time
  - Location (optional)
- Income management
- Detailed transaction history
- Search and filtering capabilities

#### AI Assistant Integration

- Natural language processing for:
  - Quick expense entry
  - Income recording
  - Loan management
  - Transaction categorization

### 3. Loan Management System

- Track borrowed money
- Record lent amounts
- Store keeper information:
  - Name
  - description
  - Transaction history
- Due date tracking
- Edit/delete functionality
- Reminder system

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    full_name TEXT,
    avatar_url TEXT
);
```

### Transactions Table

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    description TEXT,
    category TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Loans Table

```sql
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('BORROWED', 'LENT')),
    keeper_name TEXT NOT NULL,
    keeper_contact TEXT,
    due_date DATE,
    status VARCHAR(10) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Categories Table

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    color VARCHAR(7),
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Project Structure

```
wallet/
├── app/                      # Main application directory
│   ├── _layout.tsx          # Root layout component
│   ├── index.tsx            # Entry point
│   ├── (auth)/              # Authentication routes
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (app)/               # Protected app routes
│   │   ├── home.tsx
│   │   ├── transactions/
│   │   ├── loans/
│   │   └── settings/
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/         # Shared components
│   │   ├── forms/          # Form components
│   │   └── layouts/        # Layout components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API and external services
│   │   ├── api.ts         # API client
│   │   ├── supabase.ts    # Supabase client
│   │   └── ai.ts          # AI service integration
│   ├── utils/             # Utility functions
│   ├── constants/         # Constants and configurations
│   ├── types/            # TypeScript type definitions
│   └── context/          # React Context providers
├── assets/               # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
├── Docs/                # Documentation
├── supabase/            # Supabase configurations
│   └── migrations/      # Database migrations
├── tests/              # Test files
├── .env               # Environment variables
├── app.json          # Expo configuration
├── package.json      # Dependencies
└── tsconfig.json     # TypeScript configuration
```

## App Flow

1. **Login/Signup**

   - Email authentication
   - Redirect to home on success
2. **Home Screen**

   - Display total balance
   - Current date
   - Transaction history
   - Quick add buttons
   - AI chat interface
3. **Lending & Borrowing**

   - Loan records table
   - Add new entries
   - Edit existing records

## Planned Enhancements

- [ ] Custom expense categories
- [ ] Data export functionality
- [ ] Financial analytics
- [ ] Multi-currency support
- [ ] Budget planning tools

## Development Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Configure Supabase credentials
4. Start development server: `npm start`

## Contributing

Please refer to CONTRIBUTING.md for development guidelines and code standards.
