/**
 * PDF Invoice Generator — Huis ter Huynen
 * Premium, minimalist invoice matching the lodge brand.
 * Uses pdfkit to generate A4 PDFs as Buffer for email attachment.
 */

import PDFDocument from "pdfkit";

export type InvoiceItem = {
  omschrijving: string;
  aantal: number;
  prijsExcl: number;
  btwPercentage: number; // 0, 9, or 21
};

export type InvoiceData = {
  factuurnummer: string;
  factuurdatum: string;
  gastNaam: string;
  gastEmail: string;
  gastAdres?: string;
  gastPostcode?: string;
  gastPlaats?: string;
  reserveringsnummer?: string;
  verblijfsperiode?: string;
  betaalmethode?: string;
  items: InvoiceItem[];
  opmerkingen?: string;
};

const COLORS = {
  text: "#2A2418",
  muted: "#5A534C",
  accent: "#B49A5E",
  green: "#2F4F3E",
  border: "#D6D1C7",
  bg: "#FDFBF6",
};

const COMPANY = {
  naam: "Huis ter Huynen",
  adres: "Zuiderstraat 6",
  postcode: "9491 EC",
  plaats: "Zeijen, Drenthe",
  land: "Nederland",
  telefoon: "+31 6 42568603",
  email: "lodge@huisterhuynen.nl",
  website: "www.huisterhuynen.nl",
  kvk: "96382600",
  btw: "",    // Arjan vult aan
  iban: "NL20 INGB 0114 8757 90",
};

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 55, right: 55 },
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = 485; // usable width
    const LEFT = 55;
    const RIGHT = 540;

    // ═══ HEADER ═══
    // Logo (left) — clean serif style
    doc.font("Helvetica-Bold").fontSize(22).fillColor(COLORS.green);
    doc.text("HUIS", LEFT, 48, { continued: false });
    const hw = doc.widthOfString("HUIS");
    doc.font("Helvetica").fontSize(12).fillColor(COLORS.muted);
    doc.text("TER", LEFT + hw + 7, 54, { continued: false });
    const tw = doc.widthOfString("TER");
    doc.font("Helvetica-Bold").fontSize(22).fillColor(COLORS.green);
    doc.text("HUYNEN", LEFT + hw + 7 + tw + 7, 48, { continued: false });

    // Subtitle: — BOUTIQUE LODGE —
    const subY = 80;
    const subText = "BOUTIQUE LODGE";
    doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.accent);
    // Measure text width first
    const subTextWidth = doc.widthOfString(subText, { characterSpacing: 3 });
    const subStartX = LEFT;
    // Left line
    doc.moveTo(subStartX, subY).lineTo(subStartX + 28, subY).strokeColor(COLORS.accent).lineWidth(0.5).stroke();
    // Text
    doc.text(subText, subStartX + 36, subY - 4, { characterSpacing: 3 });
    // Right line
    doc.moveTo(subStartX + 42 + subTextWidth, subY).lineTo(subStartX + 70 + subTextWidth, subY).strokeColor(COLORS.accent).lineWidth(0.5).stroke();

    // Company details (right)
    doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.muted);
    const companyLines = [
      COMPANY.naam,
      COMPANY.adres,
      `${COMPANY.postcode} ${COMPANY.plaats}`,
      COMPANY.land,
      "",
      `Tel: ${COMPANY.telefoon}`,
      `E-mail: ${COMPANY.email}`,
      `Web: ${COMPANY.website}`,
    ];
    if (COMPANY.kvk) companyLines.push("", `KvK: ${COMPANY.kvk}`);
    if (COMPANY.btw) companyLines.push(`BTW: ${COMPANY.btw}`);
    if (COMPANY.iban) companyLines.push(`IBAN: ${COMPANY.iban}`);

    let ry = 50;
    for (const line of companyLines) {
      doc.text(line, RIGHT - 160, ry, { width: 160, align: "right" });
      ry += line === "" ? 4 : 10;
    }

    // Divider
    const divY = Math.max(ry, 95) + 10;
    doc.moveTo(LEFT, divY).lineTo(RIGHT, divY).strokeColor(COLORS.border).lineWidth(0.5).stroke();

    // ═══ FACTUUR TITEL ═══
    let y = divY + 20;
    doc.font("Helvetica-Bold").fontSize(22).fillColor(COLORS.text);
    doc.text("Factuur", LEFT, y);
    y += 35;

    // ═══ KLANT + FACTUURINFO ═══
    // Left: klantgegevens
    doc.font("Helvetica").fontSize(8).fillColor(COLORS.muted);
    doc.text("FACTUUR AAN", LEFT, y);
    y += 14;
    doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.text);
    doc.text(data.gastNaam, LEFT, y);
    y += 14;
    doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted);
    if (data.gastAdres) { doc.text(data.gastAdres, LEFT, y); y += 12; }
    if (data.gastPostcode || data.gastPlaats) {
      doc.text(`${data.gastPostcode || ""} ${data.gastPlaats || ""}`.trim(), LEFT, y);
      y += 12;
    }
    doc.text(data.gastEmail, LEFT, y);

    // Right: factuurdetails
    const infoX = 340;
    let iy = divY + 55;
    const infoPairs: [string, string][] = [
      ["Factuurnummer", data.factuurnummer],
      ["Factuurdatum", data.factuurdatum],
    ];
    if (data.reserveringsnummer) infoPairs.push(["Reservering", data.reserveringsnummer]);
    if (data.verblijfsperiode) infoPairs.push(["Periode", data.verblijfsperiode]);
    if (data.betaalmethode) infoPairs.push(["Betaalmethode", data.betaalmethode]);

    for (const [label, value] of infoPairs) {
      doc.font("Helvetica").fontSize(8).fillColor(COLORS.muted);
      doc.text(label, infoX, iy, { width: 80 });
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(COLORS.text);
      doc.text(value, infoX + 85, iy, { width: 115, align: "right" });
      iy += 16;
    }

    // ═══ TABLE ═══
    y = Math.max(y, iy) + 30;

    // Table header
    doc.moveTo(LEFT, y).lineTo(RIGHT, y).strokeColor(COLORS.border).lineWidth(0.5).stroke();
    y += 8;

    const cols = [LEFT, LEFT + 230, LEFT + 290, LEFT + 355, LEFT + 420];
    const colHeaders = ["Omschrijving", "Aantal", "Excl. BTW", "BTW", "Bedrag"];
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(COLORS.muted);
    colHeaders.forEach((h, i) => {
      doc.text(h, cols[i], y, { width: i === 0 ? 220 : 60, align: i === 0 ? "left" : "right" });
    });
    y += 14;
    doc.moveTo(LEFT, y).lineTo(RIGHT, y).strokeColor(COLORS.border).lineWidth(0.5).stroke();
    y += 10;

    // Table rows
    let subtotalExcl = 0;
    const btwTotals: Record<number, { excl: number; btw: number }> = {};

    for (const item of data.items) {
      const excl = item.prijsExcl * item.aantal;
      const btw = excl * (item.btwPercentage / 100);
      const incl = excl + btw;

      subtotalExcl += excl;
      if (!btwTotals[item.btwPercentage]) btwTotals[item.btwPercentage] = { excl: 0, btw: 0 };
      btwTotals[item.btwPercentage].excl += excl;
      btwTotals[item.btwPercentage].btw += btw;

      doc.font("Helvetica").fontSize(9).fillColor(COLORS.text);
      doc.text(item.omschrijving, cols[0], y, { width: 220 });
      doc.text(String(item.aantal), cols[1], y, { width: 50, align: "right" });
      doc.text(fmt(excl), cols[2], y, { width: 60, align: "right" });
      doc.text(fmt(btw), cols[3], y, { width: 60, align: "right" });
      doc.font("Helvetica-Bold").fillColor(COLORS.text);
      doc.text(fmt(incl), cols[4], y, { width: 60, align: "right" });
      y += 18;
    }

    // Bottom line
    doc.moveTo(LEFT, y + 2).lineTo(RIGHT, y + 2).strokeColor(COLORS.border).lineWidth(0.5).stroke();
    y += 20;

    // ═══ BTW OVERZICHT (left) ═══
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(COLORS.muted);
    doc.text("BTW OVERZICHT", LEFT, y);
    y += 14;

    const btwY = y;
    for (const [pct, vals] of Object.entries(btwTotals)) {
      doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.text);
      doc.text(`BTW ${pct}%`, LEFT, y, { width: 50 });
      doc.text(fmt(vals.excl), LEFT + 55, y, { width: 60, align: "right" });
      doc.text(fmt(vals.btw), LEFT + 120, y, { width: 60, align: "right" });
      y += 14;
    }

    // ═══ TOTALEN (right) ═══
    const totalBtw = Object.values(btwTotals).reduce((s, v) => s + v.btw, 0);
    const totalIncl = subtotalExcl + totalBtw;

    let ty = btwY;
    const tLabelX = 350;
    const tValueX = 420;

    // Subtle left border
    doc.moveTo(tLabelX - 10, ty - 4).lineTo(tLabelX - 10, ty + 56).strokeColor(COLORS.accent).lineWidth(0.5).stroke();

    doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted);
    doc.text("Subtotaal excl. BTW", tLabelX, ty);
    doc.fillColor(COLORS.text).text(fmt(subtotalExcl), tValueX, ty, { width: 60, align: "right" });
    ty += 16;

    for (const [pct, vals] of Object.entries(btwTotals)) {
      doc.fillColor(COLORS.muted).text(`BTW ${pct}%`, tLabelX, ty);
      doc.fillColor(COLORS.text).text(fmt(vals.btw), tValueX, ty, { width: 60, align: "right" });
      ty += 16;
    }

    ty += 4;
    doc.moveTo(tLabelX, ty).lineTo(RIGHT, ty).strokeColor(COLORS.accent).lineWidth(0.5).stroke();
    ty += 8;

    doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.green);
    doc.text("Totaal", tLabelX, ty);
    doc.text(fmt(totalIncl), tValueX - 10, ty, { width: 90, align: "right" });
    ty += 20;

    doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted);
    doc.text("Voldaan", tLabelX, ty);
    doc.fillColor(COLORS.text).text(fmt(totalIncl), tValueX, ty, { width: 60, align: "right" });
    ty += 14;
    doc.fillColor(COLORS.muted).text("Nog te voldoen", tLabelX, ty);
    doc.font("Helvetica-Bold").fillColor(COLORS.green).text("€ 0,00", tValueX, ty, { width: 60, align: "right" });

    // ═══ FOOTER ═══
    const footY = Math.max(y, ty) + 50;
    doc.moveTo(LEFT, footY).lineTo(RIGHT, footY).strokeColor(COLORS.border).lineWidth(0.5).stroke();

    doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted);
    doc.text("Bedankt voor uw verblijf bij Huis ter Huynen.", LEFT, footY + 14, { align: "center", width: W });

    if (data.opmerkingen) {
      doc.font("Helvetica").fontSize(8).fillColor(COLORS.muted);
      doc.text(data.opmerkingen, LEFT, footY + 50, { width: W });
    }

    doc.end();
  });
}

function fmt(n: number): string {
  const formatted = Math.abs(n).toFixed(2).replace(".", ",");
  const prefix = n < 0 ? "-" : "";
  return `${prefix}€ ${formatted}`;
}
