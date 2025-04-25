import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";
import {
  stripHtml,
  getStatusText,
  getStatusColor,
  exportToJson,
  exportToXml,
  exportToYaml,
} from "../utils/bookUtils";

function FriendBooks() {
  const { friendId } = useParams();
  const [books, setBooks] = useState([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriendBooks = async () => {
      setIsLoading(true);
      try {
        const friendResponse = await axios.get(
          `http://localhost:3001/api/users/${friendId}`,
          {
            headers: {
              accessToken: localStorage.getItem("accessToken"),
            },
          }
        );
        setFriendEmail(friendResponse.data.email);

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
          <>
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

            <div className="mt-12 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Eksportuj kolekcję znajomego
              </h2>
              <div className="flex flex-col md:flex-row gap-3 justify-center">
                <button
                  onClick={() =>
                    exportToJson(books, `${friendEmail}_books.json`, setIsExporting)
                  }
                  disabled={isExporting}
                  className="px-4 py-2 bg-gray-100 text-black border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  {isExporting ? "Eksportowanie..." : "Do pliku JSON"}
                </button>
                <button
                  onClick={() =>
                    exportToXml(books, `${friendEmail}_books.xml`, setIsExporting)
                  }
                  disabled={isExporting}
                  className="px-4 py-2 bg-gray-100 text-black border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  {isExporting ? "Eksportowanie..." : "Do pliku XML"}
                </button>
                <button
                  onClick={() =>
                    exportToYaml(books, `${friendEmail}_books.yml`, setIsExporting)
                  }
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

export default FriendBooks;