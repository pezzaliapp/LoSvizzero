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

// Funzione per inviare il report via WhatsApp
function inviaWhatsApp() {
  let message = `📌 LoSvizzero - Report
Totale IVA esclusa: ${document.getElementById('totaleIva').textContent}
Costo Trasporto: ${document.getElementById('costiTrasporto').textContent}
Costo Installazione: ${document.getElementById('costiInstallazione').textContent}`;

  let url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function inviaWhatsAppCompleto() {
  const durataSelect = document.getElementById('durata');
  const durataText = durataSelect.options[durataSelect.selectedIndex].text;

  let message = `📌 LoSvizzero - Report Completo
Totale IVA esclusa: ${document.getElementById('totaleIva').textContent}
di cui Costo Trasporto: ${document.getElementById('costiTrasporto').textContent}
di cui Costo Installazione: ${document.getElementById('costiInstallazione').textContent}
Compenso: ${document.getElementById('provvigione').textContent}
-----------------------------------------
Durata: ${durataText}
Rata Mensile: ${document.getElementById('rataMensile').textContent}
Costo Giornaliero: ${document.getElementById('costoGiornaliero').textContent}
Costo Orario: ${document.getElementById('costoOrario').textContent}`;

  let url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

// Funzione per generare il PDF
function generaPDF(includeNoleggio, includeProvvigione) {
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("LoSvizzero - Report", 20, 20);

  doc.setFontSize(12);
  doc.text("Totale IVA esclusa: " + document.getElementById('totaleIva').textContent, 20, 40);
  doc.text("Costo Trasporto: " + document.getElementById('costiTrasporto').textContent, 20, 50);
  doc.text("Costo Installazione: " + document.getElementById('costiInstallazione').textContent, 20, 60);

  if (includeProvvigione) {
    doc.text("Compenso: " + document.getElementById('provvigione').textContent, 20, 70);
  }

  if (includeNoleggio) {
    let y = (includeProvvigione ? 80 : 70) + 10;
    const durataSelect = document.getElementById('durata');
    const durataText = durataSelect.options[durataSelect.selectedIndex].text;
    doc.text("Durata: " + durataText, 20, y);
    y += 10;
    doc.text("Rata Mensile: " + document.getElementById('rataMensile').textContent, 20, y);
    y += 10;
    doc.text("Costo Giornaliero: " + document.getElementById('costoGiornaliero').textContent, 20, y);
    y += 10;
    doc.text("Costo Orario: " + document.getElementById('costoOrario').textContent, 20, y);
  }

  doc.save("LoSvizzero_Report.pdf");
}
