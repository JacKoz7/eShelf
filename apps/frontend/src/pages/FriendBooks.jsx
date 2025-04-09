import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";

const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

function FriendBooks() {
  const { friendId } = useParams();
  const [books, setBooks] = useState([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriendBooks = async () => {
      setIsLoading(true);
      try {
        // Pobierz dane znajomego
        const friendResponse = await axios.get(
          `http://localhost:3001/api/users/${friendId}`,
          {
            headers: {
              accessToken: localStorage.getItem("accessToken"),
            },
          }
        );
        setFriendEmail(friendResponse.data.email);

        // Pobierz książki znajomego
        const booksResponse = await axios.get(
          `http://localhost:3001/api/users/friends/${friendId}/books`,
          {
            headers: {
              accessToken: localStorage.getItem("accessToken"),
            },
          }
        );
        setBooks(booksResponse.data);
      } catch (error) {
        toast.error("Wystąpił błąd podczas pobierania książek znajomego");
        console.error("Error fetching friend books:", error);
        navigate("/friendlist");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendBooks();
  }, [friendId, navigate]);

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

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kolekcja książek: {friendEmail}
          </h1>
          <button
            onClick={() => navigate("/friendlist")}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Powrót do listy znajomych
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Ten użytkownik nie ma jeszcze żadnych książek
            </p>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FriendBooks;
