# Waterlily Survey Application

A complete health survey web application that helps collect important information about people's health, background, and financial situation. This application has two main parts: a user-friendly interface (frontend) built with React + TailwindCSS and a server (backend) built with Node.js + Express.js for handling logic and MySQL for data storage.

The application allows users to create accounts, log in securely, and fill out detailed surveys about their personal information, health conditions, financial status, and demographic background. All this information is safely stored in a database and can be reviewed before submission.

## List of Content

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Survey Data Collection](#survey-data-collection)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

##  Overview

The Waterlily Health Survey is a complete web application that helps healthcare organizations collect detailed information from patients or users. Here's what the application does:

**Users:**
- **Create an Account**: Users can sign up with their email and password to access the survey
- **Secure Login**: Once registered, users can log in safely using their credentials
- **Fill Out Surveys**: Users complete detailed forms covering their personal, health, financial, and background information
- **Review Information**: Before submitting, users can review all their answers to make sure everything is correct
- **Submit Data**: Users can save and submit their survey responses securely




## Features

### Frontend Features
- **User Authentication**: Secure login and registration
- **Comprehensive Survey Form**: Multi-section form covering:
  - Personal Information
  - Demographic Data
  - Financial Information
  - Health Information
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Form Validation**: Client-side validation with required fields
- **Data Review**: Review section before submission
- **Real-time Updates**: Dynamic form interactions

### Backend Features
- **RESTful API**: Express.js server with TypeScript
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Database Integration**: MySQL database with Sequelize ORM
- **Data Persistence**: Complete survey data storage and retrieval
- **Middleware**: Authentication middleware for protected routes
- **Error Handling**: Comprehensive error handling and validation

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Hooks** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MySQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Project Structure

```
TakeHometest/
├── front-end/                 # React frontend application
│   ├── src/
│   │   ├── component/        # React components
│   │   │   ├── Login.tsx
│   │   │   ├── SignUp.tsx
│   │   │   └── Survey_Form.tsx
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   └── vite.config.ts
├── back-end/                 # Node.js backend application
│   ├── src/
│   │   ├── routes/          # API routes
│   │   │   ├── auth.ts      # Authentication routes
│   │   │   └── survey.ts    # Survey routes
│   │   ├── middleware/      # Custom middleware
│   │   │   └── authmiddleware.ts
│   │   ├── db.ts            # Database configuration
│   │   └── index.ts         # Server entry point
│   └── package.json
└── README.md
```

## Prerequisites

Before running this application, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MySQL** database server
- **Git** (for cloning the repository)

## 🚀 Installation

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd TakeHometest
   ```

2. **Install backend dependencies**
   ```
   cd back-end
   npm install
   ```

3. **Install frontend dependencies**
   ```
   cd ../front-end
   npm install
   ```

## Configuration

### Backend Configuration

1. **Create environment file**
   ```
   cd back-end
   cp .env.example .env
   ```

2. **Configure database connection**
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=waterlily
   JWT_SECRET=your_jwt_secret_key
   PORT=4000
   ```

3. **Set up MySQL database**
   ```
   Use the provided schema file (recommended)
   mysql -u your_username -p < back-end/schema.sql
   
   ```

### Frontend Configuration

The frontend is configured to connect to `http://localhost:4000` by default. Update the `API_URL` in components if needed.

## Running the Application

### Development Mode

1. **Start the backend server**
   ```
   cd back-end
   npm run dev
   ```
   Server will run on `http://localhost:4000`

2. **Start the frontend development server**
   ```
   cd front-end
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Access the application**
   - Open your browser and navigate to `http://localhost:5173`
   - Register a new account or login with existing credentials

### Production Mode

1. **Build the frontend**
   ```bash
   cd front-end
   npm run build
   ```

2. **Build the backend**
   ```bash
   cd back-end
   npm run build
   ```

3. **Start the production server**
   ```bash
   cd back-end
   npm start
   ```

## API Endpoints

### Authentication Routes
- `POST /auth/login` - User login
- `POST /auth/signup` - User signup

### Survey Routes
- `GET /survey/complete` - Get user's survey data
- `POST /survey/complete` - Submit survey data

## 🗄️ Database Schema

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `first_name`
- `last_name`

### Survey Data Tables
- **Demographic Data**: race_ethnicity, marital_status, employment_status, etc.
- **Financial Data**: annual_income, insurance information, etc.
- **Health Data**: medical conditions, medications, allergies, etc.

## Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. **Registration**: Users create accounts with email and password
2. **Login**: Users authenticate and receive a JWT token
3. **Protected Routes**: Survey endpoints require valid JWT tokens
4. **Token Storage**: Tokens are stored in localStorage on the frontend

## Survey Data Collection

The survey collects comprehensive information across four main categories:

### 1. Personal Information
- First Name
- Last Name

### 2. Demographic Information
- Gender
- Date of Birth
- Race/Ethnicity (multi-select)
- Marital Status
- Employment Status
- Education Level
- ZIP Code
- Household Size
- Primary Language
- Veteran Status

### 3. Financial Information
- Annual Income Range
- Health Insurance Status
- Insurance Type
- Long-term Care Insurance
- Estate Planning

### 4. Health Information
- Medical Conditions (multi-select)
- Current Medications (multi-select)
- Mobility Assistance Needs
- Allergies (multi-select)
- Emergency Contact
- Primary Care Physician

## 🛠 Development

### Code Style
- **ESLint**: Configured for React and TypeScript
- **TypeScript**: Strict type checking enabled
- **Prettier**: Code formatting (if configured)

### Development Scripts

**Frontend:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

**Backend:**
```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript
npm start        # Start production server
```


##  Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request


## Support

For support or questions, please contact [gajulasambhavi@gmail.com] or create an issue in the repository.


