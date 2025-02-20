const express = require("express");
const { chromium } = require("playwright"); // Usamos playwright para la conversión
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const FormData = require("form-data");

const app = express();
app.use(express.json()); // Para parsear JSON

// Endpoint para convertir texto a PDF y subirlo
app.post("/convert", async (req, res) => {
  try {
    const { textContent } = req.body;
    if (!textContent) {
      return res.status(400).json({ error: "Text content is required" });
    }

    // Generar el HTML con el contenido del texto
    const htmlContent = `<html><body><h1>Texto Generado</h1><p>${textContent}</p></body></html>`;

    // Crear el PDF usando Playwright
    const pdfPath = await generatePdf(htmlContent);

    // Subir el archivo PDF a tmpfiles.org
    const fileUrl = await uploadFile(pdfPath);

    // Eliminar el archivo PDF local
    fs.unlinkSync(pdfPath);
    console.log("PDF eliminado del servidor local.");

    // Enviar la URL del archivo subido
    res.status(200).json({ pdfUrl: fileUrl });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al procesar el PDF" });
  }
});

// Función para generar el PDF con Playwright
const generatePdf = async (htmlContent) => {
  const browser = await chromium.launch({ headless: true }); // Lanzar el navegador
  const page = await browser.newPage();
  await page.setContent(htmlContent); // Establecer el contenido HTML
  const pdfBuffer = await page.pdf(); // Convertir el contenido a PDF
  const pdfPath = path.join(__dirname, "output.pdf");
  fs.writeFileSync(pdfPath, pdfBuffer); // Guardar el PDF en el disco
  await browser.close(); // Cerrar el navegador
  return pdfPath; // Retornar la ruta del PDF generado
};

// Función para subir el archivo PDF a tmpfiles.org
const uploadFile = async (filePath) => {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  try {
    const response = await axios.post(
      "https://tmpfiles.org/api/v1/upload",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );
    console.log("Archivo subido con éxito:", response.data);
    return response.data.data.url; // Retornar la URL del archivo subido
  } catch (error) {
    console.error("Error al subir archivo:", error);
    throw error;
  }
};

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log("Servidor Express corriendo en el puerto 3000");
});
