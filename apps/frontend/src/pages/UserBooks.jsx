import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  stripHtml,
  getStatusText,
  getStatusColor,
  exportToJson,
  exportToXml,
  exportToYaml,
} from "../utils/bookUtils";

function UserBooks() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [visibleBooks, setVisibleBooks] = useState([]);
  const bookRefs = useRef([]);
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
        bookRefs.current = response.data.map(() => React.createRef());
      } catch (error) {
        toast.error("Wystąpił błąd podczas pobierania książek");
        console.error("Error fetching books:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBooks();
  }, []);

  useEffect(() => {
    if (!isLoading && books.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const bookId = entry.target.dataset.bookId;
              setVisibleBooks((prev) =>
                prev.includes(bookId) ? prev : [...prev, bookId]
              );
            }
          });
        },
        { threshold: 0.1 }
      );

      bookRefs.current.forEach((ref) => {
        if (ref.current) {
          observer.observe(ref.current);
        }
      });

      return () => {
        bookRefs.current.forEach((ref) => {
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        });
      };
    }
  }, [isLoading, books]);

  const handleDelete = async (bookId) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę książkę?")) {
      try {
        await axios.delete(`http://localhost:3001/api/books/${bookId}`, {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        });
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
          <>
            <div className="space-y-6">
              {books.map((book, index) => (
                <div
                  key={book._id}
                  ref={bookRefs.current[index]}
                  data-book-id={book._id}
                  className={`border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow transform ${
                    visibleBooks.includes(book._id)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  } transition-all duration-700 ease-in-out`}
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
                      <h3 className="text-sm font-medium text-gray-900">
                        Opis
                      </h3>
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

            <div className="mt-12 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Eksportuj kolekcję
              </h2>
              <div className="flex flex-col md:flex-row gap-3 justify-center">
                <button
                  onClick={() => exportToJson(books, "books.json", setIsExporting)}
                  disabled={isExporting}
                  className="px-4 py-2 bg-gray-100 text-black border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  {isExporting ? "Eksportowanie..." : "Do pliku JSON"}
                </button>
                <button
                  onClick={() => exportToXml(books, "books.xml", setIsExporting)}
                  disabled={isExporting}
                  className="px-4 py-2 bg-gray-100 text-black border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  {isExporting ? "Eksportowanie..." : "Do pliku XML"}
                </button>
                <button
                  onClick={() => exportToYaml(books, "books.yml", setIsExporting)}
                  disabled={isExporting}
                  className="px-4 py-2 bg-gray-100 text-black border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  {isExporting ? "Eksportowanie..." : "Do pliku YAML"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserBooks;