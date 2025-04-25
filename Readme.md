# eShelf 📚

**eShelf** is your personal digital bookshelf — an all-in-one platform to manage your book collection with ease. Log in, add books, edit them, export/import in multiple formats, and even search the Google Books API directly from your dashboard.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- Secure registration and login with hashed passwords.
- JWT-based authentication for secure access to protected routes.

### 📂 Book Management
- Add books manually via form: title, author, year, ISBN, description, status (`read`, `reading`, `to-read`).
- Import books from `.json`, `.xml`, or `.yaml` files.
- Search and add books via the Google Books REST API.
- View and manage your collection: update details, delete entries.
- Export collection to `.json`, `.xml`, or `.yaml` files.

### 🏢 App Structure
- **Dashboard**: Add new books and search via Google Books.
- **My Books**: View, edit, delete or export your collection.
- **Friends**: Add or remove friends, view their books, and export their collections.
- **Login/Register**: Simple, secure, and fast onboarding.

### 📞 Tech Highlights
- MongoDB-powered backend with Mongoose ORM.
- RESTful API architecture.
- Dockerized frontend & backend.
- Book CRUD operations fully protected by JWT.
- Form validation on both frontend and backend.
- Ready for SOAP integration.

### 👥 Friends 
- Add friends by their unique email address.
- Browse your friends' book collections.
- Export your friends' libraries to `.json`, `.xml`, or `.yaml` formats.
- Remove friends at any time.

---

## 📄 Project Requirements Checklist

| Feature | Status |
|--------|--------|
| Export/Import (XML) | ✅ |
| Export/Import (JSON/YAML) | ✅ |
| Export/Import from DB | ✅ |
| ORM usage (Mongoose) | ✅ |
| SOAP service integration | ❌ (planned) |
| REST API integration | ✅ |
| Dockerized deployment | ✅ |
| JWT-based auth | ✅ |
| MongoDB + CRUD operations | ✅ |
| Password hashing & secure routes | ✅ |
| Client/server-side form validation | ✅ |
| Isolation levels in DB | ❌ (planned) |

---

## 🛠️ Tech Stack

### Backend:
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs for auth
- Axios (REST communication)
- Optional: `soap` package for future SOAP services

### Frontend:
- React
- Formik + Yup (form handling & validation)
- Axios (API calls)
- jwt-decode + js-cookie (auth management)
- Tailwind CSS + React Toastify (styling + notifications)

---

## 🔧 How to Run the Project

1. **Start all services using Docker:**
```bash
docker-compose up --build
```

2. **Remove old containers:**
```bash
docker-compose down 
```

---

## 📁 Assets & Test Data

Sample data is located in the `assets` folder:
- `books.json`
- `books.xml`
- `books.yml`

You can use these to test import/export features.

---

## 🚫 Logout Anytime

Simply click the logout button on any page to securely exit your session. JWTs are cleared and access is revoked.

---

## ✨ Author
Created by **Jacek Kozłowski** ☕️

