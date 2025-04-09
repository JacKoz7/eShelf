# eShelf

eShelf is a web application that allows users to manage their book collections. Users can add, edit, delete, and search for books through a REST API integration with Google Books. The application supports user authentication and authorization using JWT tokens and provides functionalities for importing and exporting book data in JSON, XML, and YAML formats.

## Table of Contents
- [Features](#features)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication and authorization using JWT tokens
- Add books manually or search and add from Google Books API
- Manage book collection (CRUD operations)
- Import and export book data in JSON, XML, and YAML formats
- Integration with MongoDB for data storage
- REST API architecture
- Docker support for containerized deployment

## Getting Started

### Prerequisites
- Node.js
- npm
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/JacKoz7/eShelf.git
   cd eShelf
   ```

2. Install dependencies for both frontend and backend:
   ```sh
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../apps/frontend
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the `backend` directory with the following variables:
     ```env
     MONGO_URI=<Your MongoDB URI>
     JWT_SECRET=<Your JWT Secret>
     ```

### Usage

#### Running the Application

To run both frontend and backend simultaneously using Docker:
```sh
docker-compose up --build
```
To remove old containers and volumes:
```sh
docker-compose down -v
```

Alternatively, you can run the frontend and backend separately:

1. Start the backend server:
   ```sh
   cd backend
   npm run dev
   ```

2. Start the frontend server:
   ```sh
   cd ../apps/frontend
   npm start
   ```

## API Endpoints

### User Endpoints
- `POST /register`: Register a new user
- `POST /login`: Login and obtain a JWT token
- `GET /users`: Get all users (requires token)
- `GET /users/logged_in`: Get logged-in users (requires token)
- `PATCH /users/:id`: Edit user data (requires token)
- `DELETE /users/:id`: Delete a user (requires token)
- `POST /logout`: Logout user (requires token)

### Book Endpoints
- `POST /books`: Add a new book (requires token)
- `GET /books`: Get all books
- `GET /books/user/:userId`: Get books of a specific user
- `GET /books/me`: Get books of the logged-in user (requires token)
- `GET /books/:id`: Get a single book
- `PATCH /books/:id`: Update a book (requires token)
- `DELETE /books/:id`: Delete a book (requires token)
- `GET /books/search`: Search books using Google Books API
- `POST /books/import`: Import books from JSON, XML, or YAML
- `POST /books/export`: Export books to JSON, XML, or YAML

## Database Schema

### User Collection
- `id`: Unique identifier
- `email`: User's email address
- `password`: Hashed password
- `isLoggedIn`: User's login status
- `createdAt`: Account creation date
- `updatedAt`: Last update date

### Book Collection
- `userId`: ID of the user who owns the book
- `title`: Title of the book
- `author`: Author of the book
- `publishYear`: Year of publication
- `ISBN`: ISBN number
- `description`: Book description
- `status`: Reading status (enum: ['read', 'reading', 'to-read'])

## Dependencies

### Backend
- `express`
- `bcryptjs`
- `cors`
- `dotenv`
- `soap`
- `axios`
- `mongoose`
- `jsonwebtoken`
- `nodemon` (dev dependency)

### Frontend
- `axios`
- `react-router-dom`
- `formik`
- `yup`
- `jwt-decode`
- `js-cookie`
- `tailwindcss`
- `postcss`
- `autoprefixer`
- `react-toastify`

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.