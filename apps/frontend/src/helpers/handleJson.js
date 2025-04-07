export const parseBookJson = (fileContent) => {
    try {
      const data = JSON.parse(fileContent);
      
      // Obsługa różnych formatów plików JSON
      if (Array.isArray(data)) {
        return data; // Jeśli plik zawiera bezpośrednio tablicę książek
      } else if (data.books && Array.isArray(data.books)) {
        return data.books; // Jeśli książki są w polu 'books'
      }
      
      throw new Error('Nieprawidłowy format pliku JSON');
    } catch (error) {
      console.error('Błąd parsowania JSON:', error);
      throw new Error('Nie udało się przetworzyć pliku JSON');
    }
  };
  
  export const validateBooks = (books) => {
    return books.map(book => {
      // Normalizacja danych
      return {
        title: book.title || '',
        author: Array.isArray(book.author) ? book.author : [book.author || 'Nieznany autor'],
        publishYear: book.publishYear || null,
        ISBN: book.ISBN || book.isbn || '', // Obsługa różnych nazw pól
        description: book.description || '',
        status: ['to-read', 'reading', 'read'].includes(book.status) ? book.status : 'to-read'
      };
    });
  };