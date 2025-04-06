import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

function UserBooks() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserBooks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/books/mybooks",
          {
            headers: {
              accessToken: localStorage.getItem("accessToken"),
            },
          }
        );
        setBooks(response.data);
      } catch (error) {
        toast.error("Wystąpił błąd podczas pobierania książek");
        console.error("Error fetching books:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBooks();
  }, []);

  const getStatusText = (status) => {
    switch (status) {
      case "to-read":
        return "Do przeczytania";
      case "reading":
        return "W trakcie czytania";
      case "read":
        return "Przeczytana";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "to-read":
        return "bg-yellow-100 text-yellow-800";
      case "reading":
        return "bg-blue-100 text-blue-800";
      case "read":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDelete = async (bookId) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę książkę?")) {
      try {
        await axios.delete(`http://localhost:3001/api/books/${bookId}`, {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        });
        // Usuń książkę z lokalnego stanu
        setBooks(books.filter((book) => book._id !== bookId));
        toast.success("Książka została usunięta");
      } catch (error) {
        toast.error("Wystąpił błąd podczas usuwania książki");
        console.error("Error deleting book:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Twoje książki
          </h1>
          <p className="text-lg text-gray-600">
            Lista wszystkich książek w Twojej kolekcji
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nie masz jeszcze żadnych książek w kolekcji
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Dodaj pierwszą książkę
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {books.map((book) => (
              <div
                key={book._id}
                className="border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {book.title}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Autor:{" "}
                      {Array.isArray(book.author)
                        ? book.author.join(", ")
                        : book.author}
                    </p>
                    {book.publishYear && (
                      <p className="text-gray-600 mt-1">
                        Rok wydania: {book.publishYear}
                      </p>
                    )}
                    {book.ISBN && (
                      <p className="text-gray-600 mt-1">ISBN: {book.ISBN}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      book.status
                    )}`}
                  >
                    {getStatusText(book.status)}
                  </span>
                </div>

                {book.description && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-900">Opis</h3>
                    <p className="text-gray-600 mt-1">
                      {stripHtml(book.description)}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-4">
                  <button
                    onClick={() => navigate(`/edit-book/${book._id}`)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => handleDelete(book._id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserBooks;