// ============================================================
// PASOS:
// 1. Ve a https://script.google.com → Nuevo proyecto
// 2. Pega este codigo en Code.gs (reemplaza todo)
// 3. Clic en "Implementar" > "Nueva implementacion"
//    - Tipo: "Aplicacion web"
//    - Ejecutar como: "Yo"
//    - Acceso: "Cualquier persona"
// 4. Copia la URL y pegala en diagnostico-ia.html donde dice PEGA_AQUI_TU_URL
// ============================================================

const EMAIL_DESTINO = "alejandromarin@solbyte.com";
const NOMBRE_HOJA = "Diagnosticos IA";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    guardarEnSheet(data);
    enviarEmail(data);
    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function guardarEnSheet(data) {
  var ss, files = DriveApp.getFilesByName(NOMBRE_HOJA);
  ss = files.hasNext() ? SpreadsheetApp.open(files.next()) : SpreadsheetApp.create(NOMBRE_HOJA);
  var sheet = ss.getSheetByName("Respuestas") || ss.insertSheet("Respuestas");

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Fecha", "Nombre", "Empresa", "Email", "Telefono",
      "Puntuacion", "Nivel",
      "Procesos internos", "Atencion al cliente", "Marketing digital",
      "Administracion", "Datos e informes", "Inteligencia Artificial",
      "Equipo y formacion", "Integracion de sistemas"
    ]);
    sheet.getRange(1, 1, 1, 15).setFontWeight("bold").setBackground("#EEEDFE");
  }

  sheet.appendRow([
    new Date().toLocaleString("es-ES"),
    data.name, data.company, data.email, data.phone,
    data.pct + "%", data.level,
    data.areas[0] + "%", data.areas[1] + "%", data.areas[2] + "%",
    data.areas[3] + "%", data.areas[4] + "%", data.areas[5] + "%",
    data.areas[6] + "%", data.areas[7] + "%"
  ]);
  sheet.autoResizeColumns(1, 15);
}

function enviarEmail(data) {
  var areas = [
    "Procesos internos", "Atencion al cliente", "Marketing digital",
    "Administracion", "Datos e informes", "Inteligencia Artificial",
    "Equipo y formacion", "Integracion de sistemas"
  ];

  var filas = "";
  for (var i = 0; i < areas.length; i++) {
    var color = data.areas[i] < 34 ? "#e74c3c" : data.areas[i] < 67 ? "#f39c12" : "#27ae60";
    filas += "<tr>"
      + "<td style='padding:6px 12px'>" + areas[i] + "</td>"
      + "<td style='padding:6px 12px'>"
      + "<div style='background:#f0f0f0;border-radius:4px;height:8px;width:200px;display:inline-block;vertical-align:middle'>"
      + "<div style='background:" + color + ";border-radius:4px;height:8px;width:" + data.areas[i] + "%'></div>"
      + "</div> " + data.areas[i] + "%</td></tr>";
  }

  var html = "<div style='font-family:sans-serif;max-width:560px;margin:0 auto'>"
    + "<div style='background:#534AB7;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0'>"
    + "<h2 style='margin:0;font-size:18px'>Nuevo diagnostico completado</h2></div>"
    + "<div style='background:#fff;padding:24px;border:1px solid #e5e5e3;border-radius:0 0 12px 12px'>"
    + "<h3 style='margin:0 0 16px;color:#1a1a1a'>Datos del cliente</h3>"
    + "<table style='width:100%;margin-bottom:20px'>"
    + "<tr><td style='color:#888;width:100px'>Nombre:</td><td><b>" + data.name + "</b></td></tr>"
    + "<tr><td style='color:#888'>Empresa:</td><td><b>" + data.company + "</b></td></tr>"
    + "<tr><td style='color:#888'>Email:</td><td>" + data.email + "</td></tr>"
    + "<tr><td style='color:#888'>Telefono:</td><td>" + data.phone + "</td></tr></table>"
    + "<div style='background:#EEEDFE;padding:16px;border-radius:8px;text-align:center;margin-bottom:20px'>"
    + "<div style='font-size:28px;font-weight:700;color:#534AB7'>" + data.pct + "%</div>"
    + "<div style='font-size:14px;color:#534AB7;margin-top:4px'>" + data.level + "</div></div>"
    + "<h3 style='margin:0 0 12px;color:#1a1a1a'>Desglose por area</h3>"
    + "<table style='width:100%'>" + filas + "</table></div></div>";

  MailApp.sendEmail({
    to: EMAIL_DESTINO,
    subject: "Diagnostico IA - " + data.name + " (" + data.company + ") - " + data.pct + "%",
    htmlBody: html
  });
}
