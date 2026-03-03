import { Injectable } from '@nestjs/common';
import { BufferOptions, TDocumentDefinitions } from 'pdfmake/interfaces';
import * as path from 'path';
import * as fs from 'fs';

const pdfMake = require('pdfmake/build/pdfmake');

const fonts = {
  Roboto: {
    normal: path.join(
      process.cwd(),
      'src',
      'printer',
      'fonts',
      'Roboto-Regular.ttf',
    ),
    bold: path.join(
      process.cwd(),
      'src',
      'printer',
      'fonts',
      'Roboto-Medium.ttf',
    ),
    italics: path.join(
      process.cwd(),
      'src',
      'printer',
      'fonts',
      'Roboto-Italic.ttf',
    ),
    bolditalics: path.join(
      process.cwd(),
      'src',
      'printer',
      'fonts',
      'Roboto-MediumItalic.ttf',
    ),
  },
  Cabin: {
    normal: path.join(
      process.cwd(),
      'src',
      'printer',
      'fonts',
      'Cabin-Regular.ttf',
    ),
    bold: path.join(
      process.cwd(),
      'src',
      'printer',
      'fonts',
      'Cabin-Medium.ttf',
    ),
    italics: path.join(
      process.cwd(),
      'src',
      'printer',
      'fonts',
      'Cabin-Italic.ttf',
    ),
    bolditalics: path.join(
      process.cwd(),
      'src',
      'printer',
      'fonts',
      'Cabin-MediumItalic.ttf',
    ),
  },
};

@Injectable()
export class PrinterService {
  constructor() {
    // Verifica que todas las fuentes existan
    Object.entries(fonts).forEach(([fontName, styles]) => {
      Object.entries(styles).forEach(([style, fontPath]) => {
        const exists = fs.existsSync(fontPath);
        console.log(fontName, style, fontPath, exists);
        if (!exists) {
          console.error(
            `⚠️ ADVERTENCIA: No se encontró la fuente ${fontName} ${style} en ${fontPath}`,
          );
        }
      });
    });

    // Configurar las fuentes en pdfMake
    pdfMake.fonts = fonts;
  }

  createPdf(
    docDefinition: TDocumentDefinitions,
    options: BufferOptions = {},
  ): PDFKit.PDFDocument {
    return pdfMake.createPdf(docDefinition, undefined, fonts, undefined);
  }

  async createPdfBuffer(
    docDefinition: TDocumentDefinitions,
    options: BufferOptions = {},
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Validar que docDefinition no sea null o undefined
        if (!docDefinition) {
          const error = new Error('docDefinition es null o undefined');
          console.error('❌ Error en createPdfBuffer:', error.message);
          reject(error);
          return;
        }

        // Asegura que el docDefinition tenga una fuente por defecto válida
        const normalizedDocDefinition = {
          ...docDefinition,
          defaultStyle: {
            font: 'Cabin',
            ...(docDefinition.defaultStyle || {}),
          },
        };

        // Log para debug
        console.log(
          '🔍 Creando PDF con fuente por defecto:',
          normalizedDocDefinition.defaultStyle?.font,
        );

        const pdfDoc = pdfMake.createPdf(
          normalizedDocDefinition,
          undefined,
          fonts,
          undefined,
        );

        const chunks: Buffer[] = [];
        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        pdfDoc.on('end', () => {
          console.log('✅ PDF generado exitosamente');
          resolve(Buffer.concat(chunks));
        });
        pdfDoc.on('error', (error) => {
          console.error('❌ Error generando PDF:', error);
          reject(error);
        });

        pdfDoc.end();
      } catch (error) {
        console.error('❌ Error en createPdfBuffer:', error);
        reject(error);
      }
    });
  }
}
