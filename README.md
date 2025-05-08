# Academic Incentive System

A full-stack web application for an academic incentive system that allows faculty members, admin, and students to log in and submit their academic achievements (journals, books, projects, conferences, and papers).

## Features

- User authentication system with different roles (admin, faculty, students)
- Form interfaces for submitting various types of academic achievements:
  - Book/Chapter Publications
  - Funded Projects
  - Journal Publications
- Data storage in both MongoDB database and Excel format
- Responsive design that works on desktop and mobile devices
- Validation for all form inputs
- File upload capability for supporting documents (max 4MB, PDF format)

## Tech Stack

- **Frontend**: React.js with Material UI
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT-based auth system
- **File Storage**: Local storage
- **Excel Integration**: ExcelJS for Excel file generation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

## Installation

1. Clone the repository:
```
git clone <repository-url>
cd academic-incentive-system
```

2. Install backend dependencies:
```
cd server
npm install
```

3. Install frontend dependencies:
```
cd ../client
npm install
```

4. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/incentive_system
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

## Running the Application

1. Start the backend server:
```
cd server
npm run dev
```

2. Start the frontend development server:
```
cd ../client
npm run dev
```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout user

### Books
- `GET /api/books` - Get all books for current user
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create new book entry
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Projects
- `GET /api/projects` - Get all projects for current user
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project entry
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Journals
- `GET /api/journals` - Get all journals for current user
- `GET /api/journals/:id` - Get single journal
- `POST /api/journals` - Create new journal entry
- `PUT /api/journals/:id` - Update journal
- `DELETE /api/journals/:id` - Delete journal

## Folder Structure

```
academic-incentive-system/
├── client/                 # React frontend
│   ├── public/             # Public assets
│   └── src/                # Source files
│       ├── assets/         # Static assets
│       ├── components/     # Reusable components
│       ├── context/        # Context providers
│       ├── pages/          # Page components
│       └── utils/          # Utility functions
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── uploads/            # Uploaded files
│   │   ├── books/          # Book proof files
│   │   ├── projects/       # Project files
│   │   └── journals/       # Journal proof files
│   ├── utils/              # Utility functions
│   └── excel_data/         # Excel files
└── README.md               # Project documentation
```

## License

This project is licensed under the MIT License.
