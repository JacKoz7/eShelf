import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../App';

const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    publishYear: '',
    ISBN: '',
    description: '',
    status: 'to-read'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/books/${id}`, {
          headers: {
            'accessToken': localStorage.getItem('accessToken')
          }
        });
        
        const book = response.data;
        setBookData({
          title: book.title,
          author: Array.isArray(book.author) ? book.author.join(', ') : book.author,
          publishYear: book.publishYear || '',
          ISBN: book.ISBN || '',
          description: book.description || '',
          status: book.status || 'to-read'
        });
      } catch (error) {
        toast.error('Nie udało się załadować książki');
        navigate('/userbooks');
      }
    };

    fetchBook();
  }, [id, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!bookData.title.trim()) newErrors.title = 'Tytuł jest wymagany';
    if (!bookData.author.trim()) newErrors.author = 'Autor jest wymagany';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axios.put(
        `http://localhost:3001/api/books/${id}`,
        {
          title: bookData.title,
          author: bookData.author.split(',').map(a => a.trim()),
          publishYear: bookData.publishYear ? parseInt(bookData.publishYear) : undefined,
          ISBN: bookData.ISBN,
          description: bookData.description,
          status: bookData.status
        },
        {
          headers: {
            'accessToken': localStorage.getItem('accessToken')
          }
        }
      );

      toast.success('Książka została zaktualizowana!');
      setTimeout(() => {
        navigate('/userbooks');
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Wystąpił błąd podczas aktualizacji książki');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-10">
      <ToastContainer />
      <div className="w-full max-w-2xl p-8 border border-gray-300 rounded-lg shadow-md bg-white">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Edytuj książkę</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Tytuł*</label>
            <input
              id="title"
              name="title"
              type="text"
              value={bookData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">Autor* (oddziel przecinkiem dla wielu autorów)</label>
            <input
              id="author"
              name="author"
              type="text"
              value={bookData.author}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
            {errors.author && <p className="text-sm text-red-600 mt-1">{errors.author}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="publishYear" className="block text-sm font-medium text-gray-700 mb-1">Rok publikacji</label>
            <input
              id="publishYear"
              name="publishYear"
              type="number"
              value={bookData.publishYear}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="ISBN" className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
            <input
              id="ISBN"
              name="ISBN"
              type="text"
              value={bookData.ISBN}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
            <textarea
              id="description"
              name="description"
              value={stripHtml(bookData.description)}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            ></textarea>
          </div>

          <div className="mb-6">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              name="status"
              value={bookData.status}
              onChange={handleChange}
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
              {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/userbooks')}
              className="w-full py-2 px-4 bg-white text-black border border-black font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBook;