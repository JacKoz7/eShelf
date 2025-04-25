import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function FriendList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/users/friends', {
        headers: {
          accessToken: localStorage.getItem('accessToken')
        }
      });
      setFriends(response.data);
    } catch (error) {
      toast.error('Wystąpił błąd podczas pobierania znajomych');
      console.error('Error fetching friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/api/users/search/${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            accessToken: localStorage.getItem('accessToken')
          }
        }
      );
      setSearchResults(response.data);
    } catch (error) {
      toast.error('Wystąpił błąd podczas wyszukiwania');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addFriend = async (userId) => {
    try {
      await axios.post(
        `http://localhost:3001/api/users/friends/${userId}`,
        {},
        {
          headers: {
            accessToken: localStorage.getItem('accessToken')
          }
        }
      );
      toast.success('Znajomy został dodany');
      fetchFriends();
      setSearchResults(searchResults.filter(user => user._id !== userId));
    } catch (error) {
      toast.error('Wystąpił błąd podczas dodawania znajomego');
      console.error('Add friend error:', error);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await axios.delete(
        `http://localhost:3001/api/users/friends/${friendId}`,
        {
          headers: {
            accessToken: localStorage.getItem('accessToken')
          }
        }
      );
      toast.success('Znajomy został usunięty');
      setFriends(friends.filter(friend => friend._id !== friendId));
    } catch (error) {
      toast.error('Wystąpił błąd podczas usuwania znajomego');
      console.error('Remove friend error:', error);
    }
  };

  const viewFriendBooks = (friendId) => {
    navigate(`/friend-books/${friendId}`);
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Twoi znajomi</h1>
          <p className="text-lg text-gray-600">Przeglądaj i zarządzaj swoimi znajomymi</p>
        </div>

        {/* Wyszukiwarka znajomych */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Wyszukaj użytkowników po emailu"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isSearching ? 'Szukam...' : 'Wyszukaj'}
            </button>
          </form>

          {/* Wyniki wyszukiwania */}
          {searchResults.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold mb-3">Wyniki wyszukiwania</h2>
              <ul className="space-y-2">
                {searchResults.map(user => (
                  <li key={user._id} className="flex justify-between items-center p-2 hover:bg-gray-50">
                    <span>{user.email}</span>
                    <button
                      onClick={() => addFriend(user._id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Dodaj znajomego
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Lista znajomych */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 ">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nie masz jeszcze żadnych znajomych</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Twoi znajomi</h2>
            <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
              {friends.map(friend => (
                <li key={friend._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{friend.email}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => viewFriendBooks(friend._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Pokaż kolekcję
                      </button>
                      <button
                        onClick={() => removeFriend(friend._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default FriendList;