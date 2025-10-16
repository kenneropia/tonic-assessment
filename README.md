# Tonic Bank API

A versioned banking API with authentication, authorization, and transfer capabilities.

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- Redis

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables in `.env`
4. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/signin` - Login and get tokens
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/signout` - Logout (requires authentication)

### Transfers

- `POST /api/v1/transfers` - Transfer funds (requires authentication)
- `GET /api/v1/transfers/history` - Get transaction history (requires authentication)
- `GET /api/v1/transfers/all` - Get all transactions (requires admin role)

## Implementation Details

### Authentication Flow

1. User signs up/signs in and receives access and refresh tokens
2. Access token is used for API requests
3. When access token expires, refresh token is used to get a new access token
4. Refresh tokens are stored in Redis with expiry

### Transfer Process

1. Validate sender and receiver
2. Check sufficient balance
3. Create transaction record
4. Update account balances
5. Complete transaction

## Concise Documentation of Our Thought Process

This API was built with a **security-first mindset** using **defense in depth** principles. Our approach prioritized fail-safe defaults, least privilege access, and comprehensive input validation.

### Key Safety & Integrity Measures

**Authentication & Authorization:**
- Short-lived JWT tokens (15 minutes) with secure refresh mechanism via Redis
- bcrypt password hashing with role-based access control (Customer/Admin)
- Token blacklisting capability for immediate revocation

**Financial Transaction Integrity:**
- Atomic database operations with real-time balance validation
- Comprehensive transaction logging with idempotency keys
- Pre-transaction checks to prevent overdrafts and race conditions

**Data Protection & System Security:**
- Joi schema validation for all inputs (SQL/NoSQL injection prevention)
- Rate limiting protection with Helmet.js security headers
- Environment separation with secure configuration management
- Health monitoring for database connections and performance metrics


## Testing Utilities

### Add Funds Script

For testing purposes, we provide a script to add funds to user accounts:

```bash
tsx scripts/add-funds.ts <accountNumber> <amount>
```


## Development

- Build the project:
  ```
  npm run build
  ```
- Start production server:
  ```
  npm start
  ```