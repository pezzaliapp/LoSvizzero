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

// Funzioni di utilità per la conversione/formattazione dei numeri
function parseEuropeanFloat(value) {
  if (!value) return 0;
  value = value.replace(/[€\s]/g, '');
  if (value.indexOf(',') !== -1) {
    value = value.replace(/\./g, '');
    value = value.replace(',', '.');
  } else {
    value = value.replace(/\./g, '');
  }
  return parseFloat(value);
}

function formatNumber(value) {
  return parseFloat(value).toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function calcolaPrezzo() {
  const prezzoLordo = parseEuropeanFloat(document.getElementById('prezzoLordo').value);
  const sconto = parseEuropeanFloat(document.getElementById('sconto').value);
  const margine = parseEuropeanFloat(document.getElementById('margine').value);
  const trasporto = parseEuropeanFloat(document.getElementById('trasporto').value);
  const installazione = parseEuropeanFloat(document.getElementById('installazione').value);

  let totaleIvaEsclusa = parseEuropeanFloat(document.getElementById('totaleIvaManuale').value) ||
    (prezzoLordo - (prezzoLordo * (sconto / 100))) / (1 - (margine / 100));

  const provvigione = ((totaleIvaEsclusa - trasporto - installazione) * (margine / 100));

  document.getElementById('totaleIva').textContent = formatNumber(totaleIvaEsclusa) + " €";
  document.getElementById('provvigione').textContent = formatNumber(provvigione) + " €";
  document.getElementById('costiTrasporto').textContent = formatNumber(trasporto) + " €";
  document.getElementById('costiInstallazione').textContent = formatNumber(installazione) + " €";

  localStorage.setItem("totaleIvaEsclusa", totaleIvaEsclusa);
}

function calcolaNoleggio() {
  let importo = parseEuropeanFloat(document.getElementById('importo').value) ||
    parseEuropeanFloat(localStorage.getItem("totaleIvaEsclusa")) || 0;
  if (importo === 0 || isNaN(importo)) {
    alert("Per favore, inserisci un importo valido.");
    return;
  }

  let durata = parseInt(document.getElementById("durata").value);
  let coefficiente = getCoefficient(importo, durata);

  if (!coefficiente) {
    alert("Importo non valido per la simulazione di noleggio.");
    return;
  }

  let rataMensile = importo * coefficiente;
  let costoGiornaliero = rataMensile / 22;
  let costoOrario = costoGiornaliero / 8;

  document.getElementById("rataMensile").textContent = formatNumber(rataMensile) + " €";
  document.getElementById("costoGiornaliero").textContent = formatNumber(costoGiornaliero) + " €";
  document.getElementById("costoOrario").textContent = formatNumber(costoOrario) + " €";
}

// Nuova funzione per calcolare l'importo partendo dalla rata
function calcolaImporto() {
  let rataMensile = parseEuropeanFloat(document.getElementById('rataMensileInput').value);
  let durata = parseInt(document.getElementById("durata").value);

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

// Coefficienti di Noleggio
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

/* === Nuove funzioni per report, PDF e condivisione su WhatsApp === */

// Genera il report in formato testo (TXT) in base ai dati attualmente visualizzati
function generaReport(includeNoleggio, includeProvvigione) {
  let report = "Report LoSvizzero\n\n";
  let totaleIva = document.getElementById('totaleIva').textContent;
  let provvigione = document.getElementById('provvigione').textContent;
  let costiTrasporto = document.getElementById('costiTrasporto').textContent;
  let costiInstallazione = document.getElementById('costiInstallazione').textContent;
  
  report += "Totale IVA esclusa: " + totaleIva + "\n";
  if (includeProvvigione) {
    report += "Provvigione: " + provvigione + "\n";
  }
  report += "Costo Trasporto: " + costiTrasporto + "\n";
  report += "Costo Installazione: " + costiInstallazione + "\n";
  
  if (includeNoleggio) {
    let rataMensile = document.getElementById('rataMensile').textContent;
    let costoGiornaliero = document.getElementById('costoGiornaliero').textContent;
    let costoOrario = document.getElementById('costoOrario').textContent;
    report += "\n--- Simulatore Noleggio ---\n";
    report += "Rata mensile: " + rataMensile + "\n";
    report += "Costo giornaliero: " + costoGiornaliero + "\n";
    report += "Costo orario: " + costoOrario + "\n";
  }
  
  return report;
}

// Funzione per generare il PDF a partire dal report TXT
function generaPDF(includeNoleggio, includeProvvigione) {
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF();
  let report = generaReport(includeNoleggio, includeProvvigione);
  let lines = doc.splitTextToSize(report, 180);
  doc.text(lines, 10, 10);
  doc.save("report.pdf");
}

// Funzione per inviare il report tramite WhatsApp (versione breve)
function inviaWhatsApp() {
  // Invia report con solo dati di prezzo (senza noleggio e senza provvigione)
  let report = generaReport(false, false);
  let url = "https://api.whatsapp.com/send?text=" + encodeURIComponent(report);
  window.open(url, "_blank");
}

// Funzione per inviare il report completo tramite WhatsApp
function inviaWhatsAppCompleto() {
  // Invia report completo (includendo noleggio e provvigione)
  let report = generaReport(true, true);
  let url = "https://api.whatsapp.com/send?text=" + encodeURIComponent(report);
  window.open(url, "_blank");
}
