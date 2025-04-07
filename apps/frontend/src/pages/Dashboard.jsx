import React, { useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../App";
import { parseBookJson, validateBooks } from "../helpers/handleJson";
import { parseBookXml } from "../helpers/handleXml";
import { parseBookYaml } from "../helpers/handleYaml";

function Dashboard() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publishYear, setPublishYear] = useState("");
  const [isbn, setIsbn] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("to-read");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [booksToImport, setBooksToImport] = useState([]);
  const [importType, setImportType] = useState(null);
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();

  // Funkcja do obsługi przeciągania plików

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        setImportType("json");
        handleFileImport(file);
      } else if (
        file.type === "application/xml" ||
        file.name.endsWith(".xml")
      ) {
        setImportType("xml");
        handleFileImport(file);
      } else if (
        file.type === "application/yaml" ||
        file.name.endsWith(".yaml") ||
        file.name.endsWith(".yml")
      ) {
        setImportType("yaml");
        handleFileImport(file);
      } else {
        toast.error("Proszę wybrać plik JSON, XML lub YAML");
      }
    }
  }, []);

  // Funkcja do obsługi wyboru pliku XML przez przycisk
  const handleXmlFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImportType("xml");
      handleFileImport(e.target.files[0]);
      e.target.value = ""; // Reset inputa
    }
  };

  const handleYamlFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImportType("yaml");
      handleFileImport(e.target.files[0]);
      e.target.value = ""; // Reset inputa
    }
  };

  // Funkcja do obsługi wyboru pliku przez przycisk
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileImport(e.target.files[0]);
      e.target.value = ""; // Reset inputa
    }
  };

  const handleFileImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let books;
        switch (importType) {
          case "json":
            books = parseBookJson(e.target.result);
            break;
          case "xml":
            books = parseBookXml(e.target.result);
            break;
          case "yaml":
            books = parseBookYaml(e.target.result);
            break;
          default:
            throw new Error("Nieznany typ pliku");
        }
        const validatedBooks = validateBooks(books);
        setBooksToImport(validatedBooks);
        setImportDialogOpen(true);
      } catch (error) {
        toast.error(error.message);
      }
    };
    reader.readAsText(file);
  };

  // Funkcja do zapisywania zaimportowanych książek
  const saveImportedBooks = async () => {
    setIsLoading(true);
    try {
      const promises = booksToImport.map((book) =>
        axios.post("http://localhost:3001/api/books", book, {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        })
      );

      await Promise.all(promises);
      toast.success(`Pomyślnie zaimportowano ${booksToImport.length} książki`);
      setImportDialogOpen(false);
      setBooksToImport([]);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Wystąpił błąd podczas importowania książek");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Tytuł jest wymagany";
    if (!author.trim()) newErrors.author = "Autor jest wymagany";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/api/books/search/${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }
      );
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      toast.error("Wystąpił błąd podczas wyszukiwania");
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectBook = (book) => {
    setTitle(book.title);
    setAuthor(
      Array.isArray(book.author) ? book.author.join(", ") : book.author
    );
    setPublishYear(book.publishYear || "");
    setIsbn(book.ISBN || "");
    setDescription(book.description || "");
    setShowResults(false);
    setSearchQuery("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const bookData = {
        title,
        author: author.split(",").map((a) => a.trim()),
        publishYear: publishYear ? parseInt(publishYear) : undefined,
        ISBN: isbn,
        description,
        status,
      };

      const response = await axios.post(
        "http://localhost:3001/api/books",
        bookData,
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }
      );

      toast.success("Książka została dodana pomyślnie!");
      setTimeout(() => {
        setTitle("");
        setAuthor("");
        setPublishYear("");
        setIsbn("");
        setDescription("");
        setStatus("to-read");
      }, 2000);
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Wystąpił błąd podczas dodawania książki");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-10">
      <ToastContainer />
      <div
        className={`w-full max-w-2xl p-8 border-2 ${
          dragActive ? "border-blue-500" : "border-gray-300"
        } rounded-lg shadow-md bg-white relative`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {dragActive && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-50 flex items-center justify-center rounded-lg border-2 border-dashed border-blue-500 z-10">
            <div className="text-center p-6 bg-white rounded shadow-lg">
              <p className="text-lg font-medium text-blue-600">
                Upuść plik JSON tutaj
              </p>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Dodaj książkę
        </h2>

        {/* Wyszukiwarka */}
        <div className="mb-6">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Wyszukaj książkę
          </label>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Tytuł"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isSearching ? "Szukam..." : "Wyszukaj"}
            </button>
          </form>

          {showResults && (
            <div className="mt-2 border border-gray-200 rounded-md max-h-60 overflow-y-auto">
              {searchResults.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {searchResults.map((book) => (
                    <li
                      key={book.googleId}
                      className="p-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <div
                        onClick={() => selectBook(book)}
                        className="flex items-center"
                      >
                        {book.thumbnail && (
                          <img
                            src={book.thumbnail}
                            alt={book.title}
                            className="w-10 h-14 object-cover mr-3"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {book.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {Array.isArray(book.author)
                              ? book.author.join(", ")
                              : book.author}
                            {book.publishYear && ` (${book.publishYear})`}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-2 text-gray-500">Nie znaleziono książek</p>
              )}
            </div>
          )}
        </div>

        {/* Formularz dodawania */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tytuł*
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Autor* (oddziel przecinkiem dla wielu autorów)
            </label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
            {errors.author && (
              <p className="text-sm text-red-600 mt-1">{errors.author}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="publishYear"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Rok publikacji
            </label>
            <input
              id="publishYear"
              type="number"
              value={publishYear}
              onChange={(e) => setPublishYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="isbn"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ISBN
            </label>
            <input
              id="isbn"
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Opis
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            ></textarea>
          </div>

          <div className="mb-6">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="to-read">Do przeczytania</option>
              <option value="reading">W trakcie czytania</option>
              <option value="read">Przeczytana</option>
            </select>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            * Pola oznaczone gwiazdką są obowiązkowe
          </p>

          <div className="flex flex-col md:flex-row gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-black text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {isLoading ? "Dodawanie..." : "Dodaj do kolekcji"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full py-2 px-4 bg-white text-black border border-black font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Anuluj
            </button>
          </div>
        </form>

        {/* Import przyciski - zaktualizowana wersja */}
        <div className="flex flex-col md:flex-row gap-3 mt-6 justify-between">
          <div className="relative w-full">
            <input
              type="file"
              id="json-upload"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="w-full py-2 px-4 bg-gray-100 text-black border border-gray-300 rounded-md hover:bg-gray-200">
              Importuj z pliku JSON
            </button>
          </div>
          <div className="relative w-full">
            <input
              type="file"
              id="xml-upload"
              accept=".xml,application/xml"
              onChange={handleXmlFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="w-full py-2 px-4 bg-gray-100 text-black border border-gray-300 rounded-md hover:bg-gray-200">
              Importuj z pliku XML
            </button>
          </div>
          <div className="relative w-full">
            <input
              type="file"
              id="yaml-upload"
              accept=".yaml,.yml,application/yaml"
              onChange={handleYamlFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="w-full py-2 px-4 bg-gray-100 text-black border border-gray-300 rounded-md hover:bg-gray-200">
              Importuj z pliku YAML
            </button>
          </div>
        </div>
      </div>

      {/* Dialog potwierdzenia importu */}
      {importDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              Potwierdź import książek
            </h3>
            <p className="mb-4">
              Czy na pewno chcesz dodać {booksToImport.length} książek do swojej
              kolekcji?
            </p>

            <div className="max-h-60 overflow-y-auto mb-4 border rounded p-2">
              {booksToImport.map((book, index) => (
                <div key={index} className="mb-2 pb-2 border-b last:border-b-0">
                  <p className="font-medium">{book.title}</p>
                  <p className="text-sm text-gray-600">
                    {book.author.join(", ")}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setImportDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Anuluj
              </button>
              <button
                onClick={saveImportedBooks}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading
                  ? "Importowanie..."
                  : `Dodaj ${booksToImport.length} książek`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
