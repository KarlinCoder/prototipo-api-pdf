module.exports = {
  use: {
    browserName: "chromium", // o 'firefox' o 'webkit'
    channel: "chrome", // especificar el canal, puede ser 'firefox' también
    installBrowsers: false, // Evita que Playwright intente instalar los navegadores automáticamente
  },
};
