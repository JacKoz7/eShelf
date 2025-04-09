export const parseBookXml = (xmlString) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const books = [];
  
      const parserError = xmlDoc.getElementsByTagName("parsererror");
      if (parserError.length > 0) {
        throw new Error('Nieprawidłowy format pliku XML');
      }
  
      const bookNodes = xmlDoc.getElementsByTagName("book");
      for (let i = 0; i < bookNodes.length; i++) {
        const bookNode = bookNodes[i];
        const getValue = (tagName) => {
          const element = bookNode.getElementsByTagName(tagName)[0];
          return element ? element.textContent : '';
        };
  
        books.push({
          title: getValue('title'),
          author: [getValue('author')], // XML może mieć tylko jednego autora
          publishYear: getValue('publishYear') || null,
          ISBN: getValue('ISBN'),
          description: getValue('description'),
          status: getValue('status') || 'to-read'
        });
      }
  
      return books;
    } catch (error) {
      console.error('Błąd parsowania XML:', error);
      throw new Error('Nie udało się przetworzyć pliku XML');
    }
  };