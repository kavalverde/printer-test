import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';

export interface AutorizacionCobroData {
  // === 1. DATOS DEL TITULAR - PERSONAS NATURALES ===
  nombreCompleto?: string;
  documentoIdentidad?: string;

  // === 1.2 PERSONAS JURÍDICAS (opcional) ===
  razonSocial?: string;
  ruc?: string;
  representanteNombre?: string;
  representanteCargo?: string;
  representanteDocumento?: string;

  // === 2. DATOS DEL PROVEEDOR DEL SERVICIO ===
  proveedorNombre?: string;
  proveedorRuc?: string;
  servicioContratado?: string;

  // === 3. DATOS DE LA FORMA DE PAGO ===
  // Checkbox - selección (true para marcar)
  debitoCuenta?: boolean; // Si es true, se marca débito a cuenta
  cargoTarjeta?: boolean; // Si es true, se marca cargo a tarjeta

  // Datos según forma de pago
  tipoCuenta?: string; // "Ahorro" o "Corriente"
  numeroCuenta?: string;
  numeroTarjeta?: string;
  fechaCaducidad?: string;
  cvv?: string;

  // Periodicidad
  periodicidadUnico?: boolean;
  periodicidadMensual?: boolean;
  periodicidadAnual?: boolean;
  periodicidadOtra?: boolean;
  periodicidadOtraTexto?: string; // Texto para "Otra"

  // === 5. FIRMA ===
  lugarFirma?: string;
  fechaFirma?: string; // Formato: DD/MM/YYYY o texto completo
}

@Injectable()
export class CreateAutorizacionCobroPdfBufferUseCase {
  private static readonly FIRMA_CLIENTE_PLACEHOLDER = '@FirmaCliente@';

  async execute(input?: Partial<AutorizacionCobroData>): Promise<Buffer> {
    const data = this.normalizeAutorizacionData(input);

    const templatePath = path.join(
      process.cwd(),
      'src/printer/templates',
      'autorizacion_cobro.pdf',
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template no encontrado: ${templatePath}`);
    }

    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    // Página 1 - Completar todos los datos
    if (pages[0]) {
      await this.fillPagina1(pages[0], data, font, fontBold);
    }

    // Página 2 - Firma (si es necesario completar algo adicional)
    if (pages[1]) {
      await this.fillPagina2(pages[1], data, font, fontBold);
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private normalizeAutorizacionData(
    input?: Partial<AutorizacionCobroData>,
  ): AutorizacionCobroData {
    const i = input ?? {};

    return {
      // Persona natural
      nombreCompleto: this.toStr(i.nombreCompleto),
      documentoIdentidad: this.toStr(i.documentoIdentidad),

      // Persona jurídica
      razonSocial: this.toStr(i.razonSocial),
      ruc: this.toStr(i.ruc),
      representanteNombre: this.toStr(i.representanteNombre),
      representanteCargo: this.toStr(i.representanteCargo),
      representanteDocumento: this.toStr(i.representanteDocumento),

      // Proveedor
      proveedorNombre: this.toStr(i.proveedorNombre),
      proveedorRuc: this.toStr(i.proveedorRuc),
      servicioContratado: this.toStr(i.servicioContratado),

      // Forma de pago
      debitoCuenta: i.debitoCuenta ?? false,
      cargoTarjeta: i.cargoTarjeta ?? false,
      tipoCuenta: this.toStr(i.tipoCuenta),
      numeroCuenta: this.toStr(i.numeroCuenta),
      numeroTarjeta: this.toStr(i.numeroTarjeta),
      fechaCaducidad: this.toStr(i.fechaCaducidad),
      cvv: this.toStr(i.cvv),

      // Periodicidad
      periodicidadUnico: i.periodicidadUnico ?? false,
      periodicidadMensual: i.periodicidadMensual ?? false,
      periodicidadAnual: i.periodicidadAnual ?? false,
      periodicidadOtra: i.periodicidadOtra ?? false,
      periodicidadOtraTexto: this.toStr(i.periodicidadOtraTexto),

      // Firma
      lugarFirma: this.toStr(i.lugarFirma),
      fechaFirma: this.toStr(i.fechaFirma),
    };
  }

  private toStr(v: any): string {
    if (v === null || v === undefined) return '';
    return String(v).trim();
  }

  private async fillPagina1(
    page: PDFPage,
    data: AutorizacionCobroData,
    font: PDFFont,
    fontBold: PDFFont,
  ) {
    const color = rgb(0, 0, 0);

    // NOTA: Estas coordenadas son aproximadas y deben ajustarse según el PDF real
    // Te recomiendo abrir el PDF en una herramienta como Adobe Acrobat o similar
    // para obtener las coordenadas exactas de cada campo
    
    const POS = {
      // Persona natural
      nombreCompleto: { x: 200, y: 715, maxW: 300, size: 10 },
      documentoIdentidad: { x: 200, y: 698, maxW: 200, size: 10 },

      // Persona jurídica
      razonSocial: { x: 170, y: 655, maxW: 300, size: 10 },
      ruc: { x: 80, y: 637, maxW: 150, size: 10 },
      representanteNombre: { x: 130, y: 620, maxW: 250, size: 10 },
      representanteCargo: { x: 380, y: 620, maxW: 150, size: 10 },
      representanteDocumento: { x: 200, y: 602, maxW: 200, size: 10 },

      // Proveedor
      proveedorNombre: { x: 150, y: 549, maxW: 300, size: 10 },
      proveedorRuc: { x: 150, y: 531, maxW: 150, size: 10 },
      servicioContratado: { x: 150, y: 512, maxW: 300, size: 10 },

      // Forma de pago - Checkboxes (valores aproximados)
      checkboxDebito: { x: 75, y: 425, size: 12 },
      checkboxTarjeta: { x: 317, y: 425, size: 12 },

      // Datos débito
      tipoCuentaAhorro: { x: 130, y: 407, size: 12 },
      tipoCuentaCorriente: { x: 130, y: 390, size: 12 },
      numeroCuenta: { x: 130, y: 372, maxW: 150, size: 10 },

      // Datos tarjeta
      numeroTarjeta: { x: 390, y: 407, maxW: 200, size: 10 },
      fechaCaducidad: { x: 390, y: 390, maxW: 80, size: 10 },
      cvv: { x: 390, y: 375, maxW: 50, size: 10 },

      // Periodicidad - Checkboxes
      periodicidadUnico: { x: 130, y: 351, size: 12 },
      periodicidadMensual: { x: 231, y: 351, size: 12 },
      periodicidadAnual: { x: 340, y: 351, size: 12 },
      periodicidadOtra: { x: 135, y: 334, size: 12 },
      periodicidadOtraTexto: { x: 180, y: 334, maxW: 100, size: 10 },

    };

    // === PERSONA NATURAL ===
    this.drawText(page, data.nombreCompleto || "", { ...POS.nombreCompleto, font }, color);
    this.drawText(page, data.documentoIdentidad || "", { ...POS.documentoIdentidad, font }, color);

    // === PERSONA JURÍDICA (si se proporciona) ===
    if (data.razonSocial) {
      this.drawText(page, data.razonSocial || "", { ...POS.razonSocial, font }, color);
      this.drawText(page, data.ruc || "", { ...POS.ruc, font }, color);
      this.drawText(page, data.representanteNombre || "", { ...POS.representanteNombre, font }, color);
      this.drawText(page, data.representanteCargo || "", { ...POS.representanteCargo, font }, color);
      this.drawText(page, data.representanteDocumento || "", { ...POS.representanteDocumento, font }, color);
    }

    // === PROVEEDOR ===
    this.drawText(page, data.proveedorNombre || "", { ...POS.proveedorNombre, font }, color);
    this.drawText(page, data.proveedorRuc || "", { ...POS.proveedorRuc, font }, color);
    this.drawText(page, data.servicioContratado || "", { ...POS.servicioContratado, font }, color);

    // === FORMA DE PAGO - Checkboxes ===
    if (data.debitoCuenta) {
      this.drawText(page, 'X', { ...POS.checkboxDebito, font: fontBold }, color);
    }
    if (data.cargoTarjeta) {
      this.drawText(page, 'X', { ...POS.checkboxTarjeta, font: fontBold }, color);
    }

    // Tipo de cuenta (solo si es débito)
    if (data.debitoCuenta) {
      const tipoCuentaLower = data.tipoCuenta?.toLowerCase() ?? '';
      if (tipoCuentaLower.includes('ahorro')) {
        this.drawText(page, 'X', { ...POS.tipoCuentaAhorro, font: fontBold }, color);
      } else if (tipoCuentaLower.includes('corriente')) {
        this.drawText(page, 'X', { ...POS.tipoCuentaCorriente, font: fontBold }, color);
      }
      this.drawText(page, data.numeroCuenta || "", { ...POS.numeroCuenta, font }, color);
    }

    // Datos de tarjeta (solo si es cargo a tarjeta)
    if (data.cargoTarjeta) {
      this.drawText(page, data.numeroTarjeta || "", { ...POS.numeroTarjeta, font }, color);
      this.drawText(page, data.fechaCaducidad || "", { ...POS.fechaCaducidad, font }, color);
      this.drawText(page, data.cvv || "", { ...POS.cvv, font }, color);
    }

    // Periodicidad
    if (data.periodicidadUnico) {
      this.drawText(page, 'X', { ...POS.periodicidadUnico, font: fontBold }, color);
    }
    if (data.periodicidadMensual) {
      this.drawText(page, 'X', { ...POS.periodicidadMensual, font: fontBold }, color);
    }
    if (data.periodicidadAnual) {
      this.drawText(page, 'X', { ...POS.periodicidadAnual, font: fontBold }, color);
    }
    if (data.periodicidadOtra) {
      this.drawText(page, 'X', { ...POS.periodicidadOtra, font: fontBold }, color);
    }
    this.drawText(page, data.periodicidadOtraTexto || "", { ...POS.periodicidadOtraTexto, font }, color);

  
  }

  private async fillPagina2(
    page: PDFPage,
    data: AutorizacionCobroData,
    font: PDFFont,
    fontBold: PDFFont,
  ) {
    const whiteColor = rgb(1, 1, 1); // Color blanco para placeholder (invisible)
    const color = rgb(0, 0, 0); // Color negro

    // Posición de la firma en la página 2
    const POS = {
      lugarFechaFirma: { x: 90, y: 455, maxW: 300, size: 10 },
      firmaCliente: { x: 180, y: 380, maxW: 200, size: 12 },
    };

      // Lugar y fecha de firma
    const lugarFecha = `${data.lugarFirma} ${data.fechaFirma}`.trim();
    this.drawText(page, lugarFecha, { ...POS.lugarFechaFirma, font }, color);

    // Colocar placeholder de firma (invisible)
    // this.drawText(
    //   page,
    //   CreateAutorizacionCobroPdfBufferUseCase.FIRMA_CLIENTE_PLACEHOLDER,
    //   { ...POS.firmaCliente, font },
    //   whiteColor,
    // );
  }

  private drawText(
    page: PDFPage,
    text: string,
    opts: { x: number; y: number; maxW?: number; size: number; font: PDFFont },
    color: ReturnType<typeof rgb>,
  ) {
    const clean = text || '';
    if (!clean) return;

    let size = opts.size;
    let textWidth = opts.font.widthOfTextAtSize(clean, size);

    // Ajustar tamaño si hay maxW definido y se excede
    if (opts.maxW) {
      while (size >= 6 && textWidth > opts.maxW) {
        size -= 0.5;
        textWidth = opts.font.widthOfTextAtSize(clean, size);
      }
    }

    page.drawText(clean, {
      x: opts.x,
      y: opts.y,
      size,
      font: opts.font,
      color,
    });
  }
}