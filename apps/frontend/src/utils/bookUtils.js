import * as yaml from "yaml";
import { toast } from "react-toastify";

export const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export const getStatusText = (status) => {
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

export const getStatusColor = (status) => {
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

export const downloadFile = (content, mimeType, fileName) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const escapeXml = (unsafe) => {
    if (!unsafe) return "";
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return c;
      }
    });
  };

export const exportToJson = (books, fileName, setIsExporting) => {
  setIsExporting(true);
  try {
    const cleanBooks = books.map((book) => ({
      title: book.title,
      author: book.author,
      publishYear: book.publishYear,
      ISBN: book.ISBN || "",
      description: book.description || "",
      status: book.status,
    }));

    const data = { books: cleanBooks };
    const jsonString = JSON.stringify(data, null, 2);
    downloadFile(jsonString, "application/json", fileName);
    toast.success("Pomyślnie wyeksportowano do JSON");
  } catch (error) {
    toast.error("Błąd podczas eksportu do JSON");
    console.error(error);
  } finally {
    setIsExporting(false);
  }
};

export const exportToXml = (books, fileName, setIsExporting) => {
  setIsExporting(true);
  try {
    let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<books>\n';

    books.forEach((book) => {
      xmlString += "  <book>\n";
      xmlString += `    <title>${escapeXml(book.title)}</title>\n`;

      if (Array.isArray(book.author) && book.author.length > 0) {
        xmlString += "    <authors>\n";
        book.author.forEach((author) => {
          xmlString += `      <author>${escapeXml(author)}</author>\n`;
        });
        xmlString += "    </authors>\n";
      } else {
        xmlString += `    <author>${escapeXml(
          Array.isArray(book.author) ? book.author[0] : book.author
        )}</author>\n`;
      }

      if (book.publishYear)
        xmlString += `    <publishYear>${book.publishYear}</publishYear>\n`;
      xmlString += `    <ISBN>${escapeXml(book.ISBN || "")}</ISBN>\n`;
      xmlString += `    <description>${escapeXml(
        book.description || ""
      )}</description>\n`;
      xmlString += `    <status>${book.status}</status>\n`;
      xmlString += "  </book>\n";
    });

    xmlString += "</books>";
    downloadFile(xmlString, "application/xml", fileName);
    toast.success("Pomyślnie wyeksportowano do XML");
  } catch (error) {
    toast.error("Błąd podczas eksportu do XML");
    console.error(error);
  } finally {
    setIsExporting(false);
  }
};

export const exportToYaml = (books, fileName, setIsExporting) => {
  setIsExporting(true);
  try {
    const cleanBooks = books.map((book) => ({
      title: book.title,
      author: book.author,
      publishYear: book.publishYear,
      ISBN: book.ISBN || "",
      description: book.description || "",
      status: book.status,
    }));

    const data = { books: cleanBooks };
    const yamlString = yaml.stringify(data);
    downloadFile(yamlString, "application/yaml", fileName);
    toast.success("Pomyślnie wyeksportowano do YAML");
  } catch (error) {
    toast.error("Błąd podczas eksportu do YAML");
    console.error(error);
  } finally {
    setIsExporting(false);
  }
};