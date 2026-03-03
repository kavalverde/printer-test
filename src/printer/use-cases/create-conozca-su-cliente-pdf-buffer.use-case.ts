import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';

export interface ConozcaSuClientePNData {
  // === SECCIÓN 1: INFORMACIÓN DEL CLIENTE ===
  // Datos personales básicos
  nombresApellidos?: string;
  tipoIdentificacion?: string; // Para detectar: "cedula", "pasaporte", "ruc"
  numeroIdentificacion?: string;
  ciudad?: string;
  pasaporte?: string;

  // Género - para detectar con includes()
  genero?: string; // "masculino", "femenino"

  // Estado civil - para detectar con includes()
  estadoCivil?: string; // "soltero", "casado", "union", "divorciado", "viudo"

  // Nacionalidad y nacimiento
  nacionalidad?: string;
  fechaNacimiento?: string; // "PICHA DE NACIMIENTO" - probablemente "FECHA"
  lugarNacimiento?: string; // "LUJAR DE NACIMIENTO" - probablemente "LUGAR"

  // Datos de residencia (con typos del PDF)
  ciudadResidencia?: string; // "CIUDAD DE MEDICINA" - probablemente "CIUDAD DE RESIDENCIA"
  provincia?: string;
  canton?: string; // "CAHITON" en el PDF - probablemente "CANTÓN"
  parroquia?: string; // "PARQUERA" en el PDF - probablemente "PARROQUIA"
  direccionDomicilio?: string;
  telefono?: string; // "TELÉFONO(R)"
  profesion?: string; // "PROFESÓN" en el PDF
  email?: string; // "COMBO ELECTRÓNICO"

  // Agencia y fondo - para detectar con includes()
  agencia?: string; // "GUAYAQUIL", "QUITO"
  fondo?: string; // "SMART-ONE", "AURANOVA", "IMPULSO", "QUITO", "ALTO RENDIMIENTO"

  // === SECCIÓN 2: INFORMACIÓN LABORAL ===
  // Ocupación - para detectar con includes()
  ocupacion?: string; // "dependiente", "independiente", "ama de casa", "jubilacion", "estudiante", "emprendedor"

  // Tipo de cargo - para detectar con includes()
  cargoTipo?: string; // "publico", "privado", "casan" (¿?)

  // Datos laborales
  nombreCompania?: string;
  cargo?: string;
  actividadEconomica?: string; // "ACTIVIDAD ECONÓMICA DE LA COMPAÑÍA / ACTIVIDAD A LA QUE SE DESEA"
  direccionLaboral?: string;
  ciudadLaboral?: string;
  telefonoLaboral?: string;
  emailLaboral?: string; // "COMBO ELECTRÓNICO LABORAL"

  // === SECCIÓN 3: INFORMACIÓN DEL REPRESENTANTE LEGAL O APODERADO ===
  representanteNombre?: string;
  representanteIdentificacion?: string;
  representanteDireccion?: string;
  representanteNacionalidad?: string;
  representanteEmail?: string;
  representanteTelefono?: string;

  // === SECCIÓN 4: INFORMACIÓN DEL CÓNYUGE ===
  conyugeNombre?: string;
  conyugeIdentificacion?: string; // "NÚMERO DE CIUDAD O PASAPORTE"
  conyugeNacionalidad?: string;
  conyugeGenero?: string; // "MASCULINO", "PRIMERINO" (¿FEMENINO?)
  conyugeEstadoCivil?: string; // "CASADO", "UNIÓN"
  conyugeProfesion?: string; // "PROFESÓN"
  conyugeActividadEconomica?: string;
  conyugeDireccion?: string;
  conyugeEmail?: string; // "COMBO ELECTRÓNICO"
  conyugeTelefono?: string; // "TELÉFONO(R)"

  // === SECCIÓN 5: INFORMACIÓN FINANCIERA ===
  // Preguntas sí/no - para detectar con includes()
  unidadEmpresa?: string; // "si", "no" (aparece dos veces)

  // Ingresos mensuales
  ingresosSalario?: string;
  ingresosHonorarios?: string;
  ingresosNegocioPropio?: string;
  ingresosOtros?: string;
  ingresosEspecifiqueOtros?: string; // "ESPECIFIQUE SUS OTROS BARREROS" (para ingresos)
  totalIngresos?: string;

  // Gastos mensuales
  gastosAlimentacion?: string;
  gastosEducacion?: string;
  gastosSalud?: string;
  gastosVivienda?: string;
  gastosOtros?: string;
  gastosEspecifiqueOtros?: string; // "ESPECIFIQUE SUS OTROS BARREROS" (para gastos)
  totalGastos?: string; // "TOTAL BARREROS MENSUALES"

  // Activos
  activosVehiculo?: string;
  activosCuentaPorCobrar?: string;
  activosInversiones?: string;
  activosAcciones?: string; // "Acciones y entidades"
  activosDerechosFiduciarios?: string; // "Derechos fiscales, adquiridos por herencia, y Otros activos"
  activosOtros?: string;
  activosEspecifiqueOtros?: string; // "ESPECIFIQUE SUS OTROS BARREROS" (para activos)
  totalActivos?: string;

  // Pasivos
  pasivosDeudas?: string; // "Comida por pagar" / "Deudas"
  pasivosPrestamos?: string; // "Préstamos por pagar"
  pasivosOtros?: string;
  pasivosEspecifiqueOtros?: string; // "ESPECIFIQUE SUS OTROS BARREROS" (para pasivos)
  totalPasivos?: string;

  // === SECCIÓN 6: REFERENCIAS BANCARIAS ===
  referenciasBancarias?: ReferenciaBancaria[];

  // === SECCIÓN 8: DECLARACIÓN PEP ===
  // 8.1 Persona expuesta políticamente
  esPEP?: string; // "si", "no"

  datosPEP?: {
    pais?: string; // "CAMPOS considerados destacados dentro o fuera" - probablemente País
    siNo?: string; // "si", "no" adicional
    institucion?: string;
    fechaCumplimiento?: string; // "RICHA DE CUMPLICACIÓN DEL CAMPO" - Fecha
    direccion?: string;
    telefono?: string;
  };

  // 8.2 Familiar de PEP
  esFamiliarPEP?: string; // "si", "no"

  familiarPEP?: {
    nombres?: string;
    parentesco?: string;
    campoPEP?: string; // "CAMPO DEL PEP"
  };

  // 8.3 Relación con PEP
  tieneRelacionPEP?: string; // "si", "no"

  tipoRelacionPEP?: string; // Para detectar: "comercial", "contractual", "laboral", "asociado"

  relacionPEP?: {
    nombres?: string;
  };

  // === SECCIÓN 9: FONDOS PROVENIENTES DE TERCEROS ===
  fondosTerceros?: FondoTercero[];

  // === SECCIÓN 10: BENEFICIARIO FINAL ===
  beneficiariosFinales?: BeneficiarioFinal[];
}

export interface ReferenciaBancaria {
  nombreIdentificacion?: string; // "NOMBRE DE IDENTIFICACIÓN" - nombre del banco
  tipoCuenta?: string; // Para detectar: "ahorros", "corriente"
  numeroCuenta?: string;
}

export interface FondoTercero {
  nombresCompletos?: string;
  numeroIdentificacion?: string;
  nacionalidad?: string;
  paisResidencia?: string;
  profesion?: string;
  telefono?: string;
  direccionDomicilio?: string;
  actividadEconomica?: string;
}

export interface BeneficiarioFinal {
  nombresCompletos?: string;
  porcentajeParticipacion?: string;
  numeroIdentificacion?: string; // "NO IDENTIDAD/RUC"
  nacionalidad?: string;
  paisResidencia?: string;
  parentesco?: string;
  telefono?: string;
}

@Injectable()
export class CreateConozcaSuClientePdfBufferUseCase {
  async execute(input?: Partial<ConozcaSuClientePNData>): Promise<Buffer> {
    const data = this.normalizeData(input);

    const templatePath = path.join(
      process.cwd(),
      'src/printer/templates',
      'conozca_su_cliente.pdf',
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template no encontrado: ${templatePath}`);
    }

    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    // Página 1 - Información del cliente, laboral, financiera, etc.
    if (pages[0]) {
      await this.fillPagina1(pages[0], data, font, fontBold);
    }

    // Página 2 - Declaraciones PEP, fondos terceros, beneficiario final
    if (pages[1]) {
      await this.fillPagina2(pages[1], data, font, fontBold);
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private normalizeData(
    input?: Partial<ConozcaSuClientePNData>,
  ): ConozcaSuClientePNData {
    const i = input ?? {};

    return {
      // SECCIÓN 1
      nombresApellidos: this.toStr(i.nombresApellidos),
      tipoIdentificacion: this.toStr(i.tipoIdentificacion).toLowerCase(),
      numeroIdentificacion: this.toStr(i.numeroIdentificacion),
      ciudad: this.toStr(i.ciudad),
      pasaporte: this.toStr(i.pasaporte),
      genero: this.toStr(i.genero).toLowerCase(),
      estadoCivil: this.toStr(i.estadoCivil).toLowerCase(),
      nacionalidad: this.toStr(i.nacionalidad),
      fechaNacimiento: this.toStr(i.fechaNacimiento),
      lugarNacimiento: this.toStr(i.lugarNacimiento),
      ciudadResidencia: this.toStr(i.ciudadResidencia),
      provincia: this.toStr(i.provincia),
      canton: this.toStr(i.canton),
      parroquia: this.toStr(i.parroquia),
      direccionDomicilio: this.toStr(i.direccionDomicilio),
      telefono: this.toStr(i.telefono),
      profesion: this.toStr(i.profesion),
      email: this.toStr(i.email),
      agencia: this.toStr(i.agencia).toLowerCase(),
      fondo: this.toStr(i.fondo).toLowerCase(),

      // SECCIÓN 2
      ocupacion: this.toStr(i.ocupacion).toLowerCase(),
      cargoTipo: this.toStr(i.cargoTipo).toLowerCase(),
      nombreCompania: this.toStr(i.nombreCompania),
      cargo: this.toStr(i.cargo),
      actividadEconomica: this.toStr(i.actividadEconomica),
      direccionLaboral: this.toStr(i.direccionLaboral),
      ciudadLaboral: this.toStr(i.ciudadLaboral),
      telefonoLaboral: this.toStr(i.telefonoLaboral),
      emailLaboral: this.toStr(i.emailLaboral),

      // SECCIÓN 3
      representanteNombre: this.toStr(i.representanteNombre),
      representanteIdentificacion: this.toStr(i.representanteIdentificacion),
      representanteDireccion: this.toStr(i.representanteDireccion),
      representanteNacionalidad: this.toStr(i.representanteNacionalidad),
      representanteEmail: this.toStr(i.representanteEmail),
      representanteTelefono: this.toStr(i.representanteTelefono),

      // SECCIÓN 4
      conyugeNombre: this.toStr(i.conyugeNombre),
      conyugeIdentificacion: this.toStr(i.conyugeIdentificacion),
      conyugeNacionalidad: this.toStr(i.conyugeNacionalidad),
      conyugeGenero: this.toStr(i.conyugeGenero).toLowerCase(),
      conyugeEstadoCivil: this.toStr(i.conyugeEstadoCivil).toLowerCase(),
      conyugeProfesion: this.toStr(i.conyugeProfesion),
      conyugeActividadEconomica: this.toStr(i.conyugeActividadEconomica),
      conyugeDireccion: this.toStr(i.conyugeDireccion),
      conyugeEmail: this.toStr(i.conyugeEmail),
      conyugeTelefono: this.toStr(i.conyugeTelefono),

      // SECCIÓN 5
      unidadEmpresa: this.toStr(i.unidadEmpresa).toLowerCase(),

      ingresosSalario: this.toStr(i.ingresosSalario),
      ingresosHonorarios: this.toStr(i.ingresosHonorarios),
      ingresosNegocioPropio: this.toStr(i.ingresosNegocioPropio),
      ingresosOtros: this.toStr(i.ingresosOtros),
      ingresosEspecifiqueOtros: this.toStr(i.ingresosEspecifiqueOtros),
      totalIngresos: this.toStr(i.totalIngresos),

      gastosAlimentacion: this.toStr(i.gastosAlimentacion),
      gastosEducacion: this.toStr(i.gastosEducacion),
      gastosSalud: this.toStr(i.gastosSalud),
      gastosVivienda: this.toStr(i.gastosVivienda),
      gastosOtros: this.toStr(i.gastosOtros),
      gastosEspecifiqueOtros: this.toStr(i.gastosEspecifiqueOtros),
      totalGastos: this.toStr(i.totalGastos),

      activosVehiculo: this.toStr(i.activosVehiculo),
      activosCuentaPorCobrar: this.toStr(i.activosCuentaPorCobrar),
      activosInversiones: this.toStr(i.activosInversiones),
      activosAcciones: this.toStr(i.activosAcciones),
      activosDerechosFiduciarios: this.toStr(i.activosDerechosFiduciarios),
      activosOtros: this.toStr(i.activosOtros),
      activosEspecifiqueOtros: this.toStr(i.activosEspecifiqueOtros),
      totalActivos: this.toStr(i.totalActivos),

      pasivosDeudas: this.toStr(i.pasivosDeudas),
      pasivosPrestamos: this.toStr(i.pasivosPrestamos),
      pasivosOtros: this.toStr(i.pasivosOtros),
      pasivosEspecifiqueOtros: this.toStr(i.pasivosEspecifiqueOtros),
      totalPasivos: this.toStr(i.totalPasivos),

      // SECCIÓN 6
      referenciasBancarias: i.referenciasBancarias,

      // SECCIÓN 8
      esPEP: this.toStr(i.esPEP).toLowerCase(),
      datosPEP: i.datosPEP,
      esFamiliarPEP: this.toStr(i.esFamiliarPEP).toLowerCase(),
      familiarPEP: i.familiarPEP,
      tieneRelacionPEP: this.toStr(i.tieneRelacionPEP).toLowerCase(),
      tipoRelacionPEP: this.toStr(i.tipoRelacionPEP).toLowerCase(),
      relacionPEP: i.relacionPEP,

      // SECCIÓN 9
      fondosTerceros: i.fondosTerceros,

      // SECCIÓN 10
      beneficiariosFinales: i.beneficiariosFinales,
    };
  }

  private toStr(v: any): string {
    if (v === null || v === undefined) return '';
    return String(v).trim();
  }

  private async fillPagina1(
    page: PDFPage,
    data: ConozcaSuClientePNData,
    font: PDFFont,
    fontBold: PDFFont,
  ) {
    const color = rgb(0, 0, 0);

    // NOTA: Estas coordenadas son aproximadas y deben ajustarse según el PDF real
    // Te recomiendo abrir el PDF y obtener las coordenadas exactas

    const POS = {
      // === SECCIÓN 1 ===
      // Fila superior
      nombresApellidos: { x: 125, y: 730, maxW: 250, size: 9 },
      tipoIdentificacionCedula: { x: 412, y: 733, maxW: 100, size: 10 },
      tipoIdentificacionPasaporte: { x: 459, y: 733, maxW: 100, size: 10 },
      tipoIdentificacionRUC: { x: 506, y: 733, maxW: 100, size: 10 },
      numeroIdentificacion: { x: 90, y: 702, maxW: 150, size: 10 },

      // Género checkboxes
      generoMasculino: { x: 172, y: 718, size: 12 },
      generoFemenino: { x: 228, y: 718, size: 12 },

      // Estado civil checkboxes
      estadoCivilSoltero: { x: 328, y: 718, size: 12 },
      estadoCivilCasado: { x: 378, y: 718, size: 12 },
      estadoCivilUnion: { x: 412, y: 718, size: 12 },
      estadoCivilDivorciado: { x: 458, y: 718, size: 12 },
      estadoCivilViudo: { x: 505, y: 718, size: 12 },

      // Datos personales
      nacionalidad: { x: 328, y: 702, maxW: 150, size: 10 },
      fechaNacimiento: { x: 470, y: 702, maxW: 100, size: 8 },
      lugarNacimiento: { x: 125, y: 688, maxW: 150, size: 10 },
      ciudadResidencia: { x: 308, y: 687, maxW: 150, size: 7 },
      provincia: { x: 380, y: 687, maxW: 100, size: 7 },
      canton: { x: 427, y: 687, maxW: 150, size: 7 },
      parroquia: { x: 475, y: 687, maxW: 150, size: 7 },
      direccionDomicilio: { x: 150, y: 680, maxW: 300, size: 10 },
      telefono: { x: 150, y: 610, maxW: 150, size: 10 },
      profesion: { x: 350, y: 610, maxW: 150, size: 10 },
      email: { x: 150, y: 595, maxW: 250, size: 9 },

      // Agencia checkboxes
      agenciaGuayaquil: { x: 120, y: 580, size: 12 },
      agenciaQuito: { x: 200, y: 580, size: 12 },

      // Fondo checkboxes
      fondoSmartOne: { x: 120, y: 565, size: 12 },
      fondoAuranova: { x: 200, y: 565, size: 12 },
      fondoImpulso: { x: 280, y: 565, size: 12 },
      fondoQuito: { x: 350, y: 565, size: 12 },
      fondoAltoRendimiento: { x: 410, y: 565, size: 12 },

      // === SECCIÓN 2 ===
      // Ocupación checkboxes
      ocupacionDependiente: { x: 150, y: 520, size: 12 },
      ocupacionIndependiente: { x: 230, y: 520, size: 12 },
      ocupacionAmaCasa: { x: 310, y: 520, size: 12 },
      ocupacionJubilacion: { x: 380, y: 520, size: 12 },
      ocupacionEstudiante: { x: 440, y: 520, size: 12 },
      ocupacionEmprendedor: { x: 150, y: 505, size: 12 },

      // Cargo checkboxes
      cargoPublico: { x: 230, y: 505, size: 12 },
      cargoPrivado: { x: 310, y: 505, size: 12 },
      cargoCasan: { x: 380, y: 505, size: 12 },

      // Datos laborales
      nombreCompania: { x: 180, y: 490, maxW: 250, size: 10 },
      cargo: { x: 180, y: 475, maxW: 200, size: 10 },
      actividadEconomica: { x: 180, y: 460, maxW: 300, size: 9 },
      direccionLaboral: { x: 180, y: 445, maxW: 300, size: 10 },
      ciudadLaboral: { x: 180, y: 430, maxW: 150, size: 10 },
      telefonoLaboral: { x: 180, y: 415, maxW: 150, size: 10 },
      emailLaboral: { x: 180, y: 400, maxW: 250, size: 9 },

      // === SECCIÓN 3 ===
      representanteNombre: { x: 180, y: 370, maxW: 250, size: 10 },
      representanteIdentificacion: { x: 180, y: 355, maxW: 150, size: 10 },
      representanteDireccion: { x: 180, y: 340, maxW: 250, size: 10 },
      representanteNacionalidad: { x: 180, y: 325, maxW: 150, size: 10 },
      representanteEmail: { x: 180, y: 310, maxW: 200, size: 9 },
      representanteTelefono: { x: 180, y: 295, maxW: 150, size: 10 },

      // === SECCIÓN 4 ===
      conyugeNombre: { x: 180, y: 260, maxW: 250, size: 10 },
      conyugeIdentificacion: { x: 180, y: 245, maxW: 150, size: 10 },
      conyugeNacionalidad: { x: 180, y: 230, maxW: 150, size: 10 },
      conyugeGeneroMasculino: { x: 150, y: 215, size: 12 },
      conyugeGeneroFemenino: { x: 230, y: 215, size: 12 },
      conyugeEstadoCivilCasado: { x: 310, y: 215, size: 12 },
      conyugeEstadoCivilUnion: { x: 380, y: 215, size: 12 },
      conyugeProfesion: { x: 180, y: 200, maxW: 150, size: 10 },
      conyugeActividadEconomica: { x: 180, y: 185, maxW: 200, size: 10 },
      conyugeDireccion: { x: 180, y: 170, maxW: 250, size: 10 },
      conyugeEmail: { x: 180, y: 155, maxW: 200, size: 9 },
      conyugeTelefono: { x: 180, y: 140, maxW: 150, size: 10 },

      // === SECCIÓN 5 ===
      unidadEmpresaSi1: { x: 150, y: 110, size: 12 },
      unidadEmpresaNo1: { x: 180, y: 110, size: 12 },
      unidadEmpresaSi2: { x: 150, y: 95, size: 12 },
      unidadEmpresaNo2: { x: 180, y: 95, size: 12 },

      // Ingresos
      ingresosSalario: { x: 100, y: 80, maxW: 80, size: 9 },
      ingresosHonorarios: { x: 100, y: 65, maxW: 80, size: 9 },
      ingresosNegocioPropio: { x: 100, y: 50, maxW: 80, size: 9 },
      ingresosOtros: { x: 100, y: 35, maxW: 80, size: 9 },
      ingresosEspecifiqueOtros: { x: 100, y: 20, maxW: 150, size: 8 },
      totalIngresos: { x: 100, y: 5, maxW: 80, size: 9 },

      // Gastos (columna aproximadamente x: 200)
      gastosAlimentacion: { x: 200, y: 80, maxW: 80, size: 9 },
      gastosEducacion: { x: 200, y: 65, maxW: 80, size: 9 },
      gastosSalud: { x: 200, y: 50, maxW: 80, size: 9 },
      gastosVivienda: { x: 200, y: 35, maxW: 80, size: 9 },
      gastosOtros: { x: 200, y: 20, maxW: 80, size: 9 },
      gastosEspecifiqueOtros: { x: 200, y: 5, maxW: 150, size: 8 },
      totalGastos: { x: 200, y: -10, maxW: 80, size: 9 },

      // Activos (columna aproximadamente x: 300)
      activosVehiculo: { x: 300, y: 80, maxW: 80, size: 9 },
      activosCuentaPorCobrar: { x: 300, y: 65, maxW: 80, size: 9 },
      activosInversiones: { x: 300, y: 50, maxW: 80, size: 9 },
      activosAcciones: { x: 300, y: 35, maxW: 80, size: 9 },
      activosDerechosFiduciarios: { x: 300, y: 20, maxW: 80, size: 9 },
      activosOtros: { x: 300, y: 5, maxW: 80, size: 9 },
      activosEspecifiqueOtros: { x: 300, y: -10, maxW: 150, size: 8 },
      totalActivos: { x: 300, y: -25, maxW: 80, size: 9 },

      // Pasivos (columna aproximadamente x: 400)
      pasivosDeudas: { x: 400, y: 80, maxW: 80, size: 9 },
      pasivosPrestamos: { x: 400, y: 65, maxW: 80, size: 9 },
      pasivosOtros: { x: 400, y: 50, maxW: 80, size: 9 },
      pasivosEspecifiqueOtros: { x: 400, y: 35, maxW: 150, size: 8 },
      totalPasivos: { x: 400, y: 20, maxW: 80, size: 9 },

      // === SECCIÓN 6 ===
      // Nota: Las referencias bancarias son múltiples, habría que iterar
      // Por simplicidad, pondré una posición para la primera
      referenciaBanco1: { x: 100, y: -40, maxW: 100, size: 9 },
      referenciaTipoCuenta1: { x: 220, y: -40, maxW: 80, size: 9 },
      referenciaNumeroCuenta1: { x: 320, y: -40, maxW: 120, size: 9 },
    };

    // === SECCIÓN 1 ===
    this.drawText(
      page,
      data.nombresApellidos || "",
      { ...POS.nombresApellidos, font },
      color,
    );
    this.drawText(
      page,
      data.numeroIdentificacion || "",
      { ...POS.numeroIdentificacion, font },
      color,
    );
    // Tipo de identificación
    const tipoId = data.tipoIdentificacion || '';
    if (tipoId.includes('cedula')) {
      this.drawText(
        page,
        'X',
        { ...POS.tipoIdentificacionCedula, font: fontBold },
        color,
      );
    } else if (tipoId.includes('pasaporte')) {
      this.drawText(
        page,
        'X',
        { ...POS.tipoIdentificacionPasaporte, font: fontBold },
        color,
      );
    } else if (tipoId.includes('ruc')) {
      this.drawText(
        page,
        'X',
        { ...POS.tipoIdentificacionRUC, font: fontBold },
        color,
      );
    }

    // Género
    const genero = data.genero || '';
    if (genero.includes('masculino')) {
      this.drawText(
        page,
        'X',
        { ...POS.generoMasculino, font: fontBold },
        color,
      );
    } else if (genero.includes('femenino') || genero.includes('primerino')) {
      this.drawText(
        page,
        'X',
        { ...POS.generoFemenino, font: fontBold },
        color,
      );
    }

    // Estado civil
    const estadoCivil = data.estadoCivil || '';
    if (estadoCivil.includes('solter')) {
      this.drawText(
        page,
        'X',
        { ...POS.estadoCivilSoltero, font: fontBold },
        color,
      );
    } else if (estadoCivil.includes('casad')) {
      this.drawText(
        page,
        'X',
        { ...POS.estadoCivilCasado, font: fontBold },
        color,
      );
    } else if (estadoCivil.includes('union')) {
      this.drawText(
        page,
        'X',
        { ...POS.estadoCivilUnion, font: fontBold },
        color,
      );
    } else if (estadoCivil.includes('divorciad')) {
      this.drawText(
        page,
        'X',
        { ...POS.estadoCivilDivorciado, font: fontBold },
        color,
      );
    } else if (estadoCivil.includes('viud')) {
      this.drawText(
        page,
        'X',
        { ...POS.estadoCivilViudo, font: fontBold },
        color,
      );
    }

    // Datos personales
    this.drawText(
      page,
      data.nacionalidad || "",
      { ...POS.nacionalidad, font },
      color,
    );
    this.drawText(
      page,
      data.fechaNacimiento || "",
      { ...POS.fechaNacimiento, font },
      color,
    );
    this.drawText(
      page,
      data.lugarNacimiento || "",
      { ...POS.lugarNacimiento, font },
      color,
    );
    this.drawText(
      page,
      data.ciudadResidencia || "" ,
      { ...POS.ciudadResidencia, font },
      color,
    );
    this.drawText(page, data.provincia || "", { ...POS.provincia, font }, color);
    this.drawText(page, data.canton || "", { ...POS.canton, font }, color);
    this.drawText(page, data.parroquia || "", { ...POS.parroquia, font }, color);
    this.drawText(
      page,
      data.direccionDomicilio || "" ,
      { ...POS.direccionDomicilio, font },
      color,
    );
    this.drawText(page, data.telefono || "", { ...POS.telefono, font }, color);
    this.drawText(page, data.profesion || "", { ...POS.profesion, font }, color);
    this.drawText(page, data.email || "", { ...POS.email, font }, color);

    // Agencia
    const agencia = data.agencia || '';
    if (agencia.includes('guayaquil')) {
      this.drawText(
        page,
        'X',
        { ...POS.agenciaGuayaquil, font: fontBold },
        color,
      );
    } else if (agencia.includes('quito')) {
      this.drawText(page, 'X', { ...POS.agenciaQuito, font: fontBold }, color);
    }

    // Fondo
    const fondo = data.fondo || '';
    if (fondo.includes('smart-one') || fondo.includes('smart')) {
      this.drawText(page, 'X', { ...POS.fondoSmartOne, font: fontBold }, color);
    } else if (fondo.includes('auranova')) {
      this.drawText(page, 'X', { ...POS.fondoAuranova, font: fontBold }, color);
    } else if (fondo.includes('impulso')) {
      this.drawText(page, 'X', { ...POS.fondoImpulso, font: fontBold }, color);
    } else if (fondo.includes('quito')) {
      this.drawText(page, 'X', { ...POS.fondoQuito, font: fontBold }, color);
    } else if (fondo.includes('alto') || fondo.includes('rendimiento')) {
      this.drawText(
        page,
        'X',
        { ...POS.fondoAltoRendimiento, font: fontBold },
        color,
      );
    }

    // === SECCIÓN 2 ===
    const ocupacion = data.ocupacion || '';
    if (ocupacion.includes('dependiente')) {
      this.drawText(
        page,
        'X',
        { ...POS.ocupacionDependiente, font: fontBold },
        color,
      );
    }
    if (ocupacion.includes('independiente')) {
      this.drawText(
        page,
        'X',
        { ...POS.ocupacionIndependiente, font: fontBold },
        color,
      );
    }
    if (ocupacion.includes('ama') || ocupacion.includes('casa')) {
      this.drawText(
        page,
        'X',
        { ...POS.ocupacionAmaCasa, font: fontBold },
        color,
      );
    }
    if (ocupacion.includes('jubilacion') || ocupacion.includes('jubilado')) {
      this.drawText(
        page,
        'X',
        { ...POS.ocupacionJubilacion, font: fontBold },
        color,
      );
    }
    if (ocupacion.includes('estudiante')) {
      this.drawText(
        page,
        'X',
        { ...POS.ocupacionEstudiante, font: fontBold },
        color,
      );
    }
    if (ocupacion.includes('emprendedor')) {
      this.drawText(
        page,
        'X',
        { ...POS.ocupacionEmprendedor, font: fontBold },
        color,
      );
    }

    // Tipo de cargo
    const cargoTipo = data.cargoTipo || '';
    if (cargoTipo.includes('publico')) {
      this.drawText(page, 'X', { ...POS.cargoPublico, font: fontBold }, color);
    }
    if (cargoTipo.includes('privado')) {
      this.drawText(page, 'X', { ...POS.cargoPrivado, font: fontBold }, color);
    }
    if (cargoTipo.includes('casan')) {
      this.drawText(page, 'X', { ...POS.cargoCasan, font: fontBold }, color);
    }

    // Datos laborales
    this.drawText(
      page,
      data.nombreCompania || "",
      { ...POS.nombreCompania, font },
      color,
    );
    this.drawText(page, data.cargo || "", { ...POS.cargo, font }, color);
    this.drawText(
      page,
      data.actividadEconomica || "",
      { ...POS.actividadEconomica, font },
      color,
    );
    this.drawText(
      page,
      data.direccionLaboral || "",
      { ...POS.direccionLaboral, font },
      color,
    );
    this.drawText(
      page,
      data.ciudadLaboral || "",
      { ...POS.ciudadLaboral, font },
      color,
    );
    this.drawText(
      page,
      data.telefonoLaboral || "",
      { ...POS.telefonoLaboral, font },
      color,
    );
    this.drawText(
      page,
      data.emailLaboral || "",
      { ...POS.emailLaboral, font },
      color,
    );

    // === SECCIÓN 3 ===
    if (data.representanteNombre) {
      this.drawText(
        page,
        data.representanteNombre || "",
        { ...POS.representanteNombre, font },
        color,
      );
      this.drawText(
        page,
        data.representanteIdentificacion || "",
        { ...POS.representanteIdentificacion, font },
        color,
      );
      this.drawText(
        page,
        data.representanteDireccion || "",
        { ...POS.representanteDireccion, font },
        color,
      );
      this.drawText(
        page,
        data.representanteNacionalidad || "",
        { ...POS.representanteNacionalidad, font },
        color,
      );
      this.drawText(
        page,
        data.representanteEmail || "",
        { ...POS.representanteEmail, font },
        color,
      );
      this.drawText(
        page,
        data.representanteTelefono || "",
        { ...POS.representanteTelefono, font },
        color,
      );
    }

    // === SECCIÓN 4 ===
    if (data.conyugeNombre) {
      this.drawText(
        page,
        data.conyugeNombre || "",
        { ...POS.conyugeNombre, font },
        color,
      );
      this.drawText(
        page,
        data.conyugeIdentificacion || "",
        { ...POS.conyugeIdentificacion, font },
        color,
      );
      this.drawText(
        page,
        data.conyugeNacionalidad || "",
        { ...POS.conyugeNacionalidad, font },
        color,
      );

      const conyugeGenero = data.conyugeGenero || '';
      if (conyugeGenero.includes('masculino')) {
        this.drawText(
          page,
          'X',
          { ...POS.conyugeGeneroMasculino, font: fontBold },
          color,
        );
      } else if (
        conyugeGenero.includes('femenino') ||
        conyugeGenero.includes('primerino')
      ) {
        this.drawText(
          page,
          'X',
          { ...POS.conyugeGeneroFemenino, font: fontBold },
          color,
        );
      }

      const conyugeEstadoCivil = data.conyugeEstadoCivil || '';
      if (conyugeEstadoCivil.includes('casado')) {
        this.drawText(
          page,
          'X',
          { ...POS.conyugeEstadoCivilCasado, font: fontBold },
          color,
        );
      } else if (conyugeEstadoCivil.includes('union')) {
        this.drawText(
          page,
          'X',
          { ...POS.conyugeEstadoCivilUnion, font: fontBold },
          color,
        );
      }

      this.drawText(
        page,
        data.conyugeProfesion || "",
        { ...POS.conyugeProfesion, font },
        color,
      );
      this.drawText(
        page,
        data.conyugeActividadEconomica || "",
        { ...POS.conyugeActividadEconomica, font },
        color,
      );
      this.drawText(
        page,
        data.conyugeDireccion || "",
        { ...POS.conyugeDireccion, font },
        color,
      );
      this.drawText(
        page,
        data.conyugeEmail || "",
        { ...POS.conyugeEmail, font },
        color,
      );
      this.drawText(
        page,
        data.conyugeTelefono || "",
        { ...POS.conyugeTelefono, font },
        color,
      );
    }

    // === SECCIÓN 5 ===
    const unidadEmpresa = data.unidadEmpresa || '';
    if (unidadEmpresa.includes('si')) {
      this.drawText(
        page,
        'X',
        { ...POS.unidadEmpresaSi1, font: fontBold },
        color,
      );
      this.drawText(
        page,
        'X',
        { ...POS.unidadEmpresaSi2, font: fontBold },
        color,
      );
    } else if (unidadEmpresa.includes('no')) {
      this.drawText(
        page,
        'X',
        { ...POS.unidadEmpresaNo1, font: fontBold },
        color,
      );
      this.drawText(
        page,
        'X',
        { ...POS.unidadEmpresaNo2, font: fontBold },
        color,
      );
    }

    // Ingresos
    this.drawText(
      page,
      data.ingresosSalario || "",
      { ...POS.ingresosSalario, font },
      color,
    );
    this.drawText(
      page,
      data.ingresosHonorarios || "",
      { ...POS.ingresosHonorarios, font },
      color,
    );
    this.drawText(
      page,
      data.ingresosNegocioPropio || "",
      { ...POS.ingresosNegocioPropio, font },
      color,
    );
    this.drawText(
      page,
      data.ingresosOtros || "",
      { ...POS.ingresosOtros, font },
      color,
    );
    this.drawText(
      page,
      data.ingresosEspecifiqueOtros || "",
      { ...POS.ingresosEspecifiqueOtros, font },
      color,
    );
    this.drawText(
      page,
      data.totalIngresos || "",
      { ...POS.totalIngresos, font: fontBold },
      color,
    );

    // Gastos
    this.drawText(
      page,
      data.gastosAlimentacion || "",
      { ...POS.gastosAlimentacion, font },
      color,
    );
    this.drawText(
      page,
      data.gastosEducacion || "",
      { ...POS.gastosEducacion, font },
      color,
    );
    this.drawText(page, data.gastosSalud || "", { ...POS.gastosSalud, font }, color);
    this.drawText(
      page,
      data.gastosVivienda || "",
      { ...POS.gastosVivienda, font },
      color,
    );
    this.drawText(page, data.gastosOtros || "", { ...POS.gastosOtros, font }, color);
    this.drawText(
      page,
      data.gastosEspecifiqueOtros || "",
      { ...POS.gastosEspecifiqueOtros, font },
      color,
    );
    this.drawText(
      page,
      data.totalGastos || "",
      { ...POS.totalGastos, font: fontBold },
      color,
    );

    // Activos
    this.drawText(
      page,
      data.activosVehiculo || "",
      { ...POS.activosVehiculo, font },
      color,
    );
    this.drawText(
      page,
      data.activosCuentaPorCobrar || "",
      { ...POS.activosCuentaPorCobrar, font },
      color,
    );
    this.drawText(
      page,
      data.activosInversiones || "",
      { ...POS.activosInversiones, font },
      color,
    );
    this.drawText(
      page,
      data.activosAcciones || "",
      { ...POS.activosAcciones, font },
      color,
    );
    this.drawText(
      page,
      data.activosDerechosFiduciarios || "",
      { ...POS.activosDerechosFiduciarios, font },
      color,
    );
    this.drawText(
      page,
      data.activosOtros || "",
      { ...POS.activosOtros, font },
      color,
    );
    this.drawText(
      page,
      data.activosEspecifiqueOtros || "",
      { ...POS.activosEspecifiqueOtros, font },
      color,
    );
    this.drawText(
      page,
      data.totalActivos || "",
      { ...POS.totalActivos, font: fontBold },
      color,
    );

    // Pasivos
    this.drawText(
      page,
      data.pasivosDeudas || "",
      { ...POS.pasivosDeudas, font },
      color,
    );
    this.drawText(
      page,
      data.pasivosPrestamos || "",
      { ...POS.pasivosPrestamos, font },
      color,
    );
    this.drawText(
      page,
      data.pasivosOtros || "",
      { ...POS.pasivosOtros, font },
      color,
    );
    this.drawText(
      page,
      data.pasivosEspecifiqueOtros || "",
      { ...POS.pasivosEspecifiqueOtros, font },
      color,
    );
    this.drawText(
      page,
      data.totalPasivos || "",
      { ...POS.totalPasivos, font: fontBold },
      color,
    );

    // === SECCIÓN 6 ===
    if (data.referenciasBancarias && data.referenciasBancarias.length > 0) {
      const ref = data.referenciasBancarias[0];
      this.drawText(
        page,
        ref.nombreIdentificacion || "",
        { ...POS.referenciaBanco1, font },
        color,
      );

      const tipoCuenta = (ref.tipoCuenta || '').toLowerCase();
      if (tipoCuenta.includes('ahorro')) {
        // Marcar checkbox de ahorros si existe
      } else if (tipoCuenta.includes('corriente')) {
        // Marcar checkbox de corriente
      }

      this.drawText(
        page,
        ref.numeroCuenta || "",
        { ...POS.referenciaNumeroCuenta1, font },
        color,
      );
    }
  }

  private async fillPagina2(
    page: PDFPage,
    data: ConozcaSuClientePNData,
    font: PDFFont,
    fontBold: PDFFont,
  ) {
    const color = rgb(0, 0, 0);

    const POS = {
      // === SECCIÓN 8.1 ===
      pepSi: { x: 200, y: 750, size: 12 },
      pepNo: { x: 250, y: 750, size: 12 },

      pepPais: { x: 150, y: 730, maxW: 100, size: 10 },
      pepInstitucion: { x: 280, y: 730, maxW: 150, size: 10 },
      pepFecha: { x: 150, y: 715, maxW: 80, size: 10 },
      pepDireccion: { x: 280, y: 715, maxW: 150, size: 10 },
      pepTelefono: { x: 150, y: 700, maxW: 100, size: 10 },

      // === SECCIÓN 8.2 ===
      familiarPepSi: { x: 200, y: 660, size: 12 },
      familiarPepNo: { x: 250, y: 660, size: 12 },

      familiarPepNombres: { x: 150, y: 640, maxW: 200, size: 10 },
      familiarPepParentesco: { x: 150, y: 625, maxW: 150, size: 10 },
      familiarPepCampo: { x: 150, y: 610, maxW: 150, size: 10 },

      // === SECCIÓN 8.3 ===
      relacionPepSi: { x: 200, y: 580, size: 12 },
      relacionPepNo: { x: 250, y: 580, size: 12 },

      relacionPepComercial: { x: 280, y: 560, size: 12 },
      relacionPepContractual: { x: 350, y: 560, size: 12 },
      relacionPepLaboral: { x: 420, y: 560, size: 12 },
      relacionPepAsociado: { x: 480, y: 560, size: 12 },

      relacionPepNombres: { x: 150, y: 540, maxW: 200, size: 10 },

      // === SECCIÓN 9 ===
      fondoNombres: { x: 100, y: 490, maxW: 150, size: 9 },
      fondoIdentificacion: { x: 250, y: 490, maxW: 120, size: 9 },
      fondoNacionalidad: { x: 370, y: 490, maxW: 100, size: 9 },
      fondoPais: { x: 100, y: 475, maxW: 100, size: 9 },
      fondoProfesion: { x: 200, y: 475, maxW: 100, size: 9 },
      fondoTelefono: { x: 300, y: 475, maxW: 80, size: 9 },
      fondoDireccion: { x: 380, y: 475, maxW: 120, size: 9 },
      fondoActividad: { x: 100, y: 460, maxW: 200, size: 9 },

      // === SECCIÓN 10 ===
      benNombres: { x: 100, y: 420, maxW: 150, size: 9 },
      benPorcentaje: { x: 250, y: 420, maxW: 50, size: 9 },
      benIdentificacion: { x: 300, y: 420, maxW: 120, size: 9 },
      benNacionalidad: { x: 420, y: 420, maxW: 100, size: 9 },
      benPais: { x: 100, y: 405, maxW: 100, size: 9 },
      benParentesco: { x: 200, y: 405, maxW: 100, size: 9 },
      benTelefono: { x: 300, y: 405, maxW: 80, size: 9 },
    };

    // === SECCIÓN 8.1 ===
    const esPEP = data.esPEP || '';
    if (esPEP.includes('si')) {
      this.drawText(page, 'X', { ...POS.pepSi, font: fontBold }, color);
    } else if (esPEP.includes('no')) {
      this.drawText(page, 'X', { ...POS.pepNo, font: fontBold }, color);
    }

    if (data.datosPEP) {
      this.drawText(page, data.datosPEP.pais || "", { ...POS.pepPais, font }, color);
      this.drawText(
        page,
        data.datosPEP.institucion || "",
        { ...POS.pepInstitucion, font },
        color,
      );
      this.drawText(
        page,
        data.datosPEP.fechaCumplimiento || "",
        { ...POS.pepFecha, font },
        color,
      );
      this.drawText(
        page,
        data.datosPEP.direccion || "",
        { ...POS.pepDireccion, font },
        color,
      );
      this.drawText(
        page,
        data.datosPEP.telefono || "",
        { ...POS.pepTelefono, font },
        color,
      );
    }

    // === SECCIÓN 8.2 ===
    const esFamiliarPEP = data.esFamiliarPEP || '';
    if (esFamiliarPEP.includes('si')) {
      this.drawText(page, 'X', { ...POS.familiarPepSi, font: fontBold }, color);
    } else if (esFamiliarPEP.includes('no')) {
      this.drawText(page, 'X', { ...POS.familiarPepNo, font: fontBold }, color);
    }

    if (data.familiarPEP) {
      this.drawText(
        page,
        data.familiarPEP.nombres || "",
        { ...POS.familiarPepNombres, font },
        color,
      );
      this.drawText(
        page,
        data.familiarPEP.parentesco || "",
        { ...POS.familiarPepParentesco, font },
        color,
      );
      this.drawText(
        page,
        data.familiarPEP.campoPEP || "",
        { ...POS.familiarPepCampo, font },
        color,
      );
    }

    // === SECCIÓN 8.3 ===
    const tieneRelacionPEP = data.tieneRelacionPEP || '';
    if (tieneRelacionPEP.includes('si')) {
      this.drawText(page, 'X', { ...POS.relacionPepSi, font: fontBold }, color);
    } else if (tieneRelacionPEP.includes('no')) {
      this.drawText(page, 'X', { ...POS.relacionPepNo, font: fontBold }, color);
    }

    const tipoRelacion = data.tipoRelacionPEP || '';
    if (tipoRelacion.includes('comercial')) {
      this.drawText(
        page,
        'X',
        { ...POS.relacionPepComercial, font: fontBold },
        color,
      );
    }
    if (tipoRelacion.includes('contractual')) {
      this.drawText(
        page,
        'X',
        { ...POS.relacionPepContractual, font: fontBold },
        color,
      );
    }
    if (tipoRelacion.includes('laboral')) {
      this.drawText(
        page,
        'X',
        { ...POS.relacionPepLaboral, font: fontBold },
        color,
      );
    }
    if (tipoRelacion.includes('asociado')) {
      this.drawText(
        page,
        'X',
        { ...POS.relacionPepAsociado, font: fontBold },
        color,
      );
    }

    if (data.relacionPEP) {
      this.drawText(
        page,
        data.relacionPEP.nombres || "",
        { ...POS.relacionPepNombres, font },
        color,
      );
    }

    // === SECCIÓN 9 ===
    if (data.fondosTerceros && data.fondosTerceros.length > 0) {
      const fondo = data.fondosTerceros[0];
      this.drawText(
        page,
        fondo.nombresCompletos || "",
        { ...POS.fondoNombres, font },
        color,
      );
      this.drawText(
        page,
        fondo.numeroIdentificacion || "",
        { ...POS.fondoIdentificacion, font },
        color,
      );
      this.drawText(
        page,
        fondo.nacionalidad || "",
        { ...POS.fondoNacionalidad, font },
        color,
      );
      this.drawText(
        page,
        fondo.paisResidencia || "",
        { ...POS.fondoPais, font },
        color,
      );
      this.drawText(
        page,
        fondo.profesion || "",
        { ...POS.fondoProfesion, font },
        color,
      );
      this.drawText(
        page,
        fondo.telefono || "",
        { ...POS.fondoTelefono, font },
        color,
      );
      this.drawText(
        page,
        fondo.direccionDomicilio || "",
        { ...POS.fondoDireccion, font },
        color,
      );
      this.drawText(
        page,
        fondo.actividadEconomica || "",
        { ...POS.fondoActividad, font },
        color,
      );
    }

    // === SECCIÓN 10 ===
    if (data.beneficiariosFinales && data.beneficiariosFinales.length > 0) {
      const ben = data.beneficiariosFinales[0];
      this.drawText(
        page,
        ben.nombresCompletos || "",
        { ...POS.benNombres, font },
        color,
      );
      this.drawText(
        page,
        ben.porcentajeParticipacion || "",
        { ...POS.benPorcentaje, font },
        color,
      );
      this.drawText(
        page,
        ben.numeroIdentificacion || "",
        { ...POS.benIdentificacion, font },
        color,
      );
      this.drawText(
        page,
        ben.nacionalidad || "",
        { ...POS.benNacionalidad, font },
        color,
      );
      this.drawText(page, ben.paisResidencia || "", { ...POS.benPais, font }, color);
      this.drawText(
        page,
        ben.parentesco || "",
        { ...POS.benParentesco, font },
        color,
      );
      this.drawText(page, ben.telefono || "", { ...POS.benTelefono, font }, color);
    }
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
