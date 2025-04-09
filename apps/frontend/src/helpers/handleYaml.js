import * as yaml from 'yaml';  

export const parseBookYaml = (yamlString) => {
  try {
    const data = yaml.parse(yamlString);
    
    if (Array.isArray(data)) {
      return data; 
    } else if (data.books && Array.isArray(data.books)) {
      return data.books; 
    }
    
    throw new Error('Nieprawidłowy format pliku YAML');
  } catch (error) {
    console.error('Błąd parsowania YAML:', error);
    throw new Error('Nie udało się przetworzyć pliku YAML');
  }
};