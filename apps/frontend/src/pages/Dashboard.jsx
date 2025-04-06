import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Dashboard() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publishYear, setPublishYear] = useState('');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('to-read');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = 'Tytuł jest wymagany';
    if (!author.trim()) newErrors.author = 'Autor jest wymagany';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Przygotuj dane do wysłania
      const bookData = {
        title,
        author: author.split(',').map(a => a.trim()), // Konwertuj string autorów na tablicę
        publishYear: publishYear ? parseInt(publishYear) : undefined,
        ISBN: isbn,
        description,
        status
      };

      // Wysłanie danych do API
      const response = await axios.post('http://localhost:3001/api/books', bookData, {
        headers: {
          'accessToken': localStorage.getItem('accessToken')
        }
      });

      // Obsługa sukcesu
      toast.success('Książka została dodana pomyślnie!');
      
      // Opcjonalne przekierowanie lub reset formularza
      setTimeout(() => {
        setTitle('');
        setAuthor('');
        setPublishYear('');
        setIsbn('');
        setDescription('');
        setStatus('to-read');
      }, 2000);

    } catch (error) {
      // Obsługa błędów
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Wystąpił błąd podczas dodawania książki');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-10">
      <ToastContainer />
      <div className="w-full max-w-2xl p-8 border border-gray-300 rounded-lg shadow-md bg-white">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Dodaj książkę</h2>

        {/* Wyszukiwarka */}
        <div className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Wyszukaj książkę</label>
          <div className="flex gap-2">
            <input
              id="search"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Tytuł"
            />
            <button
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Wyszukaj
            </button>
          </div>
        </div>

        {/* Formularz dodawania */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Tytuł*</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">Autor* (oddziel przecinkiem dla wielu autorów)</label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
            {errors.author && <p className="text-sm text-red-600 mt-1">{errors.author}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="publishYear" className="block text-sm font-medium text-gray-700 mb-1">Rok publikacji</label>
            <input
              id="publishYear"
              type="number"
              value={publishYear}
              onChange={(e) => setPublishYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
            <input
              id="isbn"
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            ></textarea>
          </div>

          <div className="mb-6">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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

          <p className="text-sm text-gray-600 mb-4">* Pola oznaczone gwiazdką są obowiązkowe</p>

          <div className="flex flex-col md:flex-row gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-black text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {isLoading ? 'Dodawanie...' : 'Dodaj do kolekcji'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2 px-4 bg-white text-black border border-black font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Anuluj
            </button>
          </div>
        </form>

        {/* Import przyciski */}
        <div className="flex flex-col md:flex-row gap-3 mt-6 justify-between">
          <button className="w-full py-2 px-4 bg-gray-100 text-black border border-gray-300 rounded-md hover:bg-gray-200">
            Importuj z pliku JSON
          </button>
          <button className="w-full py-2 px-4 bg-gray-100 text-black border border-gray-300 rounded-md hover:bg-gray-200">
            Importuj z pliku XML
          </button>
          <button className="w-full py-2 px-4 bg-gray-100 text-black border border-gray-300 rounded-md hover:bg-gray-200">
            Importuj z pliku YAML
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;