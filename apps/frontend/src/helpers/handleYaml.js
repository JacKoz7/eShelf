import * as yaml from 'yaml'; // lub inna biblioteka do parsowania YAML

export const parseBookYaml = (yamlString) => {
  try {
    const data = yaml.parse(yamlString);
    
    // Obsługa różnych formatów plików YAML
    if (Array.isArray(data)) {
      return data; // Jeśli plik zawiera bezpośrednio tablicę książek
    } else if (data.books && Array.isArray(data.books)) {
      return data.books; // Jeśli książki są w polu 'books'
    }
    
    throw new Error('Nieprawidłowy format pliku YAML');
  } catch (error) {
    console.error('Błąd parsowania YAML:', error);
    throw new Error('Nie udało się przetworzyć pliku YAML');
  }
};