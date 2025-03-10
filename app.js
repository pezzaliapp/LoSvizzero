document.addEventListener("DOMContentLoaded", function() {
  assignEventListeners();
});

function assignEventListeners() {
  document.getElementById('calcola').addEventListener('click', calcolaPrezzo);
  document.getElementById('calcolaNoleggio').addEventListener('click', calcolaNoleggio);
  document.getElementById('calcolaImporto').addEventListener('click', calcolaImporto);
  document.getElementById('generaPdfConNoleggio').addEventListener('click', () => generaPDF(true, false));
  document.getElementById('generaPdfSenzaNoleggio').addEventListener('click', () => generaPDF(false, false));
  document.getElementById('generaPdfConProvvigione').addEventListener('click', () => generaPDF(true, true));
  document.getElementById('inviaWhatsApp').addEventListener('click', inviaWhatsApp);
  document.getElementById('inviaWhatsAppCompleto').addEventListener('click', inviaWhatsAppCompleto);
}

// ** Funzione per calcolare la rata partendo dall'importo **
function calcolaNoleggio() {
  let importo = parseEuropeanFloat(document.getElementById('importo').value) || 0;
  let durata = parseInt(document.getElementById("durata").value);

  if (importo === 0 || isNaN(importo)) {
    alert("Per favore, inserisci un importo valido.");
    return;
  }

  let coefficiente = getCoefficient(importo, durata);
  if (!coefficiente) {
    alert("Durata non valida per la simulazione di noleggio.");
    return;
  }

  let rataMensile = importo * coefficiente;
  let costoGiornaliero = rataMensile / 22;
  let costoOrario = costoGiornaliero / 8;

  document.getElementById("rataMensile").textContent = formatNumber(rataMensile) + " €";
  document.getElementById("costoGiornaliero").textContent = formatNumber(costoGiornaliero) + " €";
  document.getElementById("costoOrario").textContent = formatNumber(costoOrario) + " €";
}

// ** Funzione per calcolare l'importo partendo dalla rata mensile **
function calcolaImporto() {
  let rataMensile = parseEuropeanFloat(document.getElementById('rataMensileInput').value);
  let durata = parseInt(document.getElementById("durata").value);

  if (rataMensile === 0 || isNaN(rataMensile)) {
    alert("Per favore, inserisci una rata valida.");
    return;
  }

  for (let maxImporto in coefficienti) {
    let coeff = coefficienti[maxImporto][durata];
    if (coeff) {
      let importoCalcolato = rataMensile / coeff;
      document.getElementById("importo").value = formatNumber(importoCalcolato);
      return;
    }
  }
  alert("Durata o rata non valida per il calcolo dell'importo.");
}

// ** Coefficienti di Noleggio **
const coefficienti = {
  5000: { 12: 0.084167, 18: 0.060596, 24: 0.047514, 36: 0.033879, 48: 0.026723, 60: 0.022489 },
  15000: { 12: 0.083542, 18: 0.059999, 24: 0.046924, 36: 0.033290, 48: 0.026122, 60: 0.021874 },
  25000: { 12: 0.083386, 18: 0.059850, 24: 0.046777, 36: 0.033143, 48: 0.025973, 60: 0.021722 },
  50000: { 12: 0.082867, 18: 0.059354, 24: 0.046290, 36: 0.032658, 48: 0.025479, 60: 0.021219 }
};

function getCoefficient(importo, durata) {
  for (let maxImporto in coefficienti) {
    if (importo <= parseInt(maxImporto)) {
      return coefficienti[maxImporto][durata];
    }
  }
  return null;
}
