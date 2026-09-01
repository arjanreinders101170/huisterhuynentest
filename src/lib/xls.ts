/* Minimale lezer voor het .xls-bestand dat Booking.com exporteert.
 *
 * Waarom eigen code en geen bibliotheek: voor legacy .xls (BIFF8) is SheetJS
 * praktisch de enige optie, en de versie op npm is verouderd en heeft bekende
 * kwetsbaarheden — de gerepareerde versies staan alleen op hun eigen CDN. Dit
 * bestand leest daarom precies wat de Booking.com-export bevat: één werkblad
 * met tekst en getallen, geen formules, geen opmaak. Alles wat daarbuiten valt
 * negeren we; lukt het lezen niet, dan kan de admin het bestand als CSV
 * aanleveren (zie parseSpreadsheet).
 *
 * Twee lagen:
 *   1. OLE2 (Compound File) — de .xls-container met daarin een "Workbook"-stream.
 *   2. BIFF8 — de recordstroom in die stream met de celwaarden.
 */

const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

/* Een lege ketenverwijzing (FREESECT) of ketenafsluiter (ENDOFCHAIN). Alles
 * vanaf 0xFFFFFFFA is speciaal; een echte sector heeft altijd een lager nummer. */
const MAX_REGULAR_SECTOR = 0xfffffffa;

/* Streams kleiner dan dit staan niet in gewone sectoren maar in de ministream. */
const MINI_STREAM_CUTOFF = 4096;

export class XlsLeesFout extends Error {
  constructor(message: string) {
    super(message);
    this.name = "XlsLeesFout";
  }
}

export function isXlsBestand(buf: Buffer): boolean {
  return buf.length >= 8 && OLE_SIGNATURE.every((b, i) => buf[i] === b);
}

/* ── Laag 1: OLE2-container ───────────────────────────────────────────── */

type OleDirEntry = { naam: string; type: number; startSector: number; grootte: number };

function volgKeten(fat: number[], start: number, maxSectoren: number): number[] {
  const keten: number[] = [];
  let sector = start;
  const gezien = new Set<number>();
  while (sector < MAX_REGULAR_SECTOR) {
    /* Een corrupt bestand kan naar zichzelf terugwijzen. Zonder deze twee
     * controles draait de lus eeuwig door op een verzonnen bestand. */
    if (gezien.has(sector) || keten.length > maxSectoren) {
      throw new XlsLeesFout("Kringverwijzing in de sectorketen");
    }
    gezien.add(sector);
    keten.push(sector);
    const volgende = fat[sector];
    if (volgende === undefined) break;
    sector = volgende;
  }
  return keten;
}

function leesSectoren(buf: Buffer, keten: number[], sectorGrootte: number, offset: number): Buffer {
  const delen = keten.map(s => {
    const start = offset + s * sectorGrootte;
    if (start + sectorGrootte > buf.length) {
      throw new XlsLeesFout("Sector wijst buiten het bestand");
    }
    return buf.subarray(start, start + sectorGrootte);
  });
  return Buffer.concat(delen);
}

/** Haalt de "Workbook"-stream uit een OLE2-container. */
function leesWorkbookStream(buf: Buffer): Buffer {
  if (!isXlsBestand(buf)) throw new XlsLeesFout("Geen geldig .xls-bestand");

  const sectorGrootte = 1 << buf.readUInt16LE(30);
  const miniSectorGrootte = 1 << buf.readUInt16LE(32);
  const aantalFatSectoren = buf.readUInt32LE(44);
  const dirStart = buf.readUInt32LE(48);
  const miniFatStart = buf.readUInt32LE(60);
  const aantalMiniFatSectoren = buf.readUInt32LE(64);
  const difatStart = buf.readUInt32LE(68);
  const aantalDifatSectoren = buf.readUInt32LE(72);

  if (sectorGrootte < 128 || sectorGrootte > 1 << 20) {
    throw new XlsLeesFout("Onverwachte sectorgrootte");
  }
  const maxSectoren = Math.ceil(buf.length / sectorGrootte) + 1;

  // DIFAT: eerste 109 verwijzingen staan in de header, de rest in eigen sectoren.
  const difat: number[] = [];
  for (let i = 0; i < 109; i++) {
    const s = buf.readUInt32LE(76 + i * 4);
    if (s < MAX_REGULAR_SECTOR) difat.push(s);
  }
  let difatSector = difatStart;
  for (let n = 0; n < aantalDifatSectoren && difatSector < MAX_REGULAR_SECTOR; n++) {
    const start = 512 + difatSector * sectorGrootte;
    if (start + sectorGrootte > buf.length) break;
    const perSector = sectorGrootte / 4 - 1;
    for (let i = 0; i < perSector; i++) {
      const s = buf.readUInt32LE(start + i * 4);
      if (s < MAX_REGULAR_SECTOR) difat.push(s);
    }
    difatSector = buf.readUInt32LE(start + sectorGrootte - 4);
  }

  // FAT: de sectorketens van alle streams.
  const fat: number[] = [];
  for (const s of difat.slice(0, Math.max(aantalFatSectoren, difat.length))) {
    const start = 512 + s * sectorGrootte;
    if (start + sectorGrootte > buf.length) continue;
    for (let i = 0; i < sectorGrootte / 4; i++) fat.push(buf.readUInt32LE(start + i * 4));
  }
  if (fat.length === 0) throw new XlsLeesFout("Geen sectortabel gevonden");

  // Directory: de inhoudsopgave met streamnamen.
  const dirBuf = leesSectoren(buf, volgKeten(fat, dirStart, maxSectoren), sectorGrootte, 512);
  const entries: OleDirEntry[] = [];
  for (let off = 0; off + 128 <= dirBuf.length; off += 128) {
    const naamLengte = dirBuf.readUInt16LE(off + 64);
    if (naamLengte < 2 || naamLengte > 64) continue;
    // Naam staat als UTF-16LE inclusief afsluitende nulbyte.
    const naam = dirBuf.toString("utf16le", off, off + naamLengte - 2);
    entries.push({
      naam,
      type: dirBuf.readUInt8(off + 66),
      startSector: dirBuf.readUInt32LE(off + 116),
      grootte: dirBuf.readUInt32LE(off + 120),
    });
  }

  const workbook = entries.find(e => e.type === 2 && (e.naam === "Workbook" || e.naam === "Book"));
  if (!workbook) throw new XlsLeesFout("Geen werkblad in het bestand gevonden");

  if (workbook.grootte >= MINI_STREAM_CUTOFF) {
    const keten = volgKeten(fat, workbook.startSector, maxSectoren);
    return leesSectoren(buf, keten, sectorGrootte, 512).subarray(0, workbook.grootte);
  }

  /* Kleine streams — en de Booking.com-export is klein — staan in de
   * ministream: één gewone stream die zelf weer in miniSectorGrootte-blokken
   * is verdeeld, met een eigen FAT. */
  const rootEntry = entries.find(e => e.type === 5);
  if (!rootEntry) throw new XlsLeesFout("Geen hoofdmap in het bestand");

  const miniStream = leesSectoren(buf, volgKeten(fat, rootEntry.startSector, maxSectoren), sectorGrootte, 512);

  const miniFat: number[] = [];
  let miniFatSector = miniFatStart;
  for (let n = 0; n < aantalMiniFatSectoren && miniFatSector < MAX_REGULAR_SECTOR; n++) {
    const start = 512 + miniFatSector * sectorGrootte;
    if (start + sectorGrootte > buf.length) break;
    for (let i = 0; i < sectorGrootte / 4; i++) miniFat.push(buf.readUInt32LE(start + i * 4));
    const volgende = fat[miniFatSector];
    if (volgende === undefined) break;
    miniFatSector = volgende;
  }

  const miniKeten = volgKeten(miniFat, workbook.startSector, miniStream.length / miniSectorGrootte + 1);
  const delen = miniKeten.map(s => miniStream.subarray(s * miniSectorGrootte, (s + 1) * miniSectorGrootte));
  return Buffer.concat(delen).subarray(0, workbook.grootte);
}

/* ── Laag 2: BIFF8-records ────────────────────────────────────────────── */

const REC = {
  BOF: 0x0809, EOF: 0x000a, SST: 0x00fc, CONTINUE: 0x003c,
  LABELSST: 0x00fd, LABEL: 0x0204, RSTRING: 0x00d6,
  NUMBER: 0x0203, RK: 0x027e, MULRK: 0x00bd, FORMULA: 0x0006, STRING: 0x0207,
} as const;

type Record_ = { type: number; data: Buffer };

function splitsRecords(stream: Buffer): Record_[] {
  const records: Record_[] = [];
  let off = 0;
  while (off + 4 <= stream.length) {
    const type = stream.readUInt16LE(off);
    const lengte = stream.readUInt16LE(off + 2);
    if (off + 4 + lengte > stream.length) break;
    records.push({ type, data: stream.subarray(off + 4, off + 4 + lengte) });
    off += 4 + lengte;
  }
  return records;
}

/* Leest de gedeelde-stringtabel (SST). Strings mogen midden in een woord over
 * een CONTINUE-record heen lopen; na zo'n grens staat opnieuw één vlagbyte die
 * zegt of het vervolg 8- of 16-bits is. Daarom lezen we over de segmenten heen
 * in plaats van ze eerst plat te plakken. */
function leesSst(segmenten: Buffer[]): string[] {
  let seg = 0;
  let off = 0;

  const overOp = () => { while (seg < segmenten.length && off >= segmenten[seg].length) { off = 0; seg++; } };
  const opGrens = () => { overOp(); return seg >= segmenten.length; };
  const byte = () => { overOp(); if (seg >= segmenten.length) throw new XlsLeesFout("SST loopt door tot buiten het bestand"); return segmenten[seg].readUInt8(off++); };
  const uint16 = () => byte() | (byte() << 8);
  const uint32 = () => (uint16() | (uint16() << 16)) >>> 0;
  const sla = (n: number) => { for (let i = 0; i < n; i++) byte(); };

  uint32();                       // totaal aantal strings incl. duplicaten
  const uniek = uint32();

  const strings: string[] = [];
  for (let i = 0; i < uniek; i++) {
    if (opGrens()) break;
    const tekens = uint16();
    const vlaggen = byte();
    let breed = (vlaggen & 0x01) !== 0;
    const rijk = (vlaggen & 0x08) !== 0;
    const phonetisch = (vlaggen & 0x04) !== 0;
    const runs = rijk ? uint16() : 0;
    const extraBytes = phonetisch ? uint32() : 0;

    let tekst = "";
    let gelezen = 0;
    while (gelezen < tekens) {
      overOp();
      if (seg >= segmenten.length) break;
      const rest = segmenten[seg].length - off;
      const perTeken = breed ? 2 : 1;
      const kan = Math.min(tekens - gelezen, Math.floor(rest / perTeken));
      if (kan > 0) {
        const eind = off + kan * perTeken;
        tekst += breed
          ? segmenten[seg].toString("utf16le", off, eind)
          : latin1NaarTekst(segmenten[seg].subarray(off, eind));
        off = eind;
        gelezen += kan;
      }
      if (gelezen < tekens) {
        // Rest van deze string staat in het volgende segment, met een nieuwe vlagbyte.
        off = segmenten[seg].length;
        overOp();
        if (seg >= segmenten.length) break;
        breed = (byte() & 0x01) !== 0;
      }
    }
    sla(runs * 4 + extraBytes);
    strings.push(tekst);
  }
  return strings;
}

/* Compressed unicode in BIFF8 is geen latin-1 maar de onderste 256 codepunten
 * van UTF-16 — voor de tekens die hier voorkomen (ö in Jungsthöfel) komt dat
 * op hetzelfde neer, maar we zetten het expliciet om zodat er nooit mojibake
 * in een gastnaam belandt. */
function latin1NaarTekst(buf: Buffer): string {
  let out = "";
  for (const b of buf) out += String.fromCharCode(b);
  return out;
}

/** RK-getallen: 30 bits met twee vlaggen voor "gedeeld door 100" en "geheel getal". */
function decodeerRk(rk: number): number {
  const honderd = (rk & 0x01) !== 0;
  let waarde: number;
  if ((rk & 0x02) !== 0) {
    waarde = rk >> 2;
  } else {
    const buf = Buffer.alloc(8);
    buf.writeInt32LE(0, 0);
    buf.writeInt32LE(rk & 0xfffffffc, 4);
    waarde = buf.readDoubleLE(0);
  }
  return honderd ? waarde / 100 : waarde;
}

/* Getallen worden als tekst teruggegeven zodat de rest van de import één
 * ingang heeft voor CSV en .xls. Reserveringsnummers zijn tien cijfers lang;
 * die mogen nooit als 6.29890e+9 in de database belanden. */
function getalNaarTekst(n: number): string {
  if (!Number.isFinite(n)) return "";
  if (Number.isInteger(n)) return n.toFixed(0);
  return String(Math.round(n * 1e6) / 1e6);
}

/** Leest het eerste werkblad van een .xls-bestand als rijen met tekstcellen. */
export function leesXls(buf: Buffer): string[][] {
  const stream = leesWorkbookStream(buf);
  const records = splitsRecords(stream);

  // SST met bijbehorende CONTINUE-records.
  let sst: string[] = [];
  for (let i = 0; i < records.length; i++) {
    if (records[i].type !== REC.SST) continue;
    const segmenten = [records[i].data];
    for (let j = i + 1; j < records.length && records[j].type === REC.CONTINUE; j++) {
      segmenten.push(records[j].data);
    }
    try {
      sst = leesSst(segmenten);
    } catch {
      sst = [];   // Beschadigde tabel: cellen vallen terug op leeg, de admin ziet dat meteen.
    }
    break;
  }

  const cellen = new Map<string, string>();
  let maxRij = -1;
  let maxKol = -1;
  const zet = (rij: number, kol: number, waarde: string) => {
    cellen.set(`${rij}:${kol}`, waarde);
    if (rij > maxRij) maxRij = rij;
    if (kol > maxKol) maxKol = kol;
  };

  /* Alleen het eerste werkblad. Een .xls bevat eerst een globaal deel en
   * daarna per blad een eigen recordstroom; zonder deze grens zouden cellen
   * van een tweede blad over die van het eerste heen schrijven. */
  let inBlad = false;
  let bladGehad = false;

  for (const r of records) {
    const d = r.data;
    if (r.type === REC.BOF) {
      if (!bladGehad && d.length >= 4 && d.readUInt16LE(2) === 0x0010) inBlad = true;
      continue;
    }
    if (r.type === REC.EOF) {
      if (inBlad) { inBlad = false; bladGehad = true; }
      continue;
    }
    if (!inBlad) continue;

    switch (r.type) {
      case REC.LABELSST: {
        if (d.length < 10) break;
        const isst = d.readUInt32LE(6);
        zet(d.readUInt16LE(0), d.readUInt16LE(2), sst[isst] ?? "");
        break;
      }
      case REC.LABEL:
      case REC.RSTRING: {
        if (d.length < 9) break;
        const tekens = d.readUInt16LE(6);
        const breed = (d.readUInt8(8) & 0x01) !== 0;
        const start = 9;
        const eind = Math.min(d.length, start + tekens * (breed ? 2 : 1));
        const tekst = breed ? d.toString("utf16le", start, eind) : latin1NaarTekst(d.subarray(start, eind));
        zet(d.readUInt16LE(0), d.readUInt16LE(2), tekst);
        break;
      }
      case REC.NUMBER: {
        if (d.length < 14) break;
        zet(d.readUInt16LE(0), d.readUInt16LE(2), getalNaarTekst(d.readDoubleLE(6)));
        break;
      }
      case REC.RK: {
        if (d.length < 10) break;
        zet(d.readUInt16LE(0), d.readUInt16LE(2), getalNaarTekst(decodeerRk(d.readInt32LE(6))));
        break;
      }
      case REC.MULRK: {
        if (d.length < 6) break;
        const rij = d.readUInt16LE(0);
        const eersteKol = d.readUInt16LE(2);
        const aantal = Math.floor((d.length - 6) / 6);
        for (let i = 0; i < aantal; i++) {
          zet(rij, eersteKol + i, getalNaarTekst(decodeerRk(d.readInt32LE(4 + i * 6 + 2))));
        }
        break;
      }
    }
  }

  if (maxRij < 0) throw new XlsLeesFout("Geen cellen gevonden in het werkblad");

  const rijen: string[][] = [];
  for (let r = 0; r <= maxRij; r++) {
    const rij: string[] = [];
    for (let c = 0; c <= maxKol; c++) rij.push(cellen.get(`${r}:${c}`) ?? "");
    rijen.push(rij);
  }
  return rijen;
}
