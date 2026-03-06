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

  // === SECCIÓN 7: REFERENCIAS COMERCIALES Y PERSONALES ===
  referenciasComerciales?: ReferenciaComercial[];

  // === SECCIÓN 8: DECLARACIÓN PEP ===
  // === SECCIÓN 8.1 — Cargo público ===
  esPEP?: string;
  pepCargo?: string;
  pepFuncionesSI?: string;
  pepInstitucion?: string;
  pepFechaCulminacion?: string;
  pepDireccion?: string;
  pepTelefono?: string;

  // === SECCIÓN 8.2 — Familiar de PEP ===
  esFamiliarPEP?: string;
  familiarPEPNombres?: string;
  familiarPEPParentesco?: string;
  familiarPEPCargo?: string;

  // === SECCIÓN 8.3 — Relación con PEP ===
  tieneRelacionPEP?: string;
  tipoRelacionPEP?: string;
  relacionPEPNombres?: string;
  relacionPEPCargo?: string;

  // === SECCIÓN 9: FONDOS PROVENIENTES DE TERCEROS ===
  fondosTerceros?: FondoTercero[];

  // === SECCIÓN 10: BENEFICIARIO FINAL ===
  beneficiariosFinales?: BeneficiarioFinal[];

  // === SECCIÓN 11 ===
  fondosProvenientesDe?: string;
  ciudadFecha?: string;
  clienteCI?: string;
  funcionarioNombre?: string;
  funcionarioCI?: string;
  funcionarioCargo?: string;

  // === SECCIÓN 12 ===
  doc12RUC?: boolean;
  doc12CertResidencia?: boolean;
  doc12Cedula?: boolean;
  doc12RolJubilacion?: boolean;
  doc12CertLaboral?: boolean;
  doc12Planilla?: boolean;
  doc12Representante?: boolean;
  doc12IVA?: boolean;
  doc12Renta?: boolean;
  doc12EstadosFinanc?: boolean;
  doc12RefComercial?: boolean;
  doc12RefBancaria?: boolean;

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

export interface ReferenciaComercial {
  nombreRazonSocial?: string;
  personaContacto?: string;
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

      ingresosSalario:          this.toNum(i.ingresosSalario),
      ingresosHonorarios:       this.toNum(i.ingresosHonorarios),
      ingresosNegocioPropio:    this.toNum(i.ingresosNegocioPropio),
      ingresosOtros:            this.toNum(i.ingresosOtros),
      ingresosEspecifiqueOtros: this.toNum(i.ingresosEspecifiqueOtros),
      totalIngresos:            this.toNum(i.totalIngresos),

      gastosAlimentacion:       this.toNum(i.gastosAlimentacion),
      gastosEducacion:          this.toNum(i.gastosEducacion),
      gastosSalud:              this.toNum(i.gastosSalud),
      gastosVivienda:           this.toNum(i.gastosVivienda),
      gastosOtros:              this.toNum(i.gastosOtros),
      gastosEspecifiqueOtros:   this.toNum(i.gastosEspecifiqueOtros),
      totalGastos:              this.toNum(i.totalGastos),

      activosVehiculo:              this.toNum(i.activosVehiculo),
      activosCuentaPorCobrar:       this.toNum(i.activosCuentaPorCobrar),
      activosInversiones:           this.toNum(i.activosInversiones),
      activosAcciones:              this.toNum(i.activosAcciones),
      activosDerechosFiduciarios:   this.toNum(i.activosDerechosFiduciarios),
      activosOtros:                 this.toNum(i.activosOtros),
      activosEspecifiqueOtros:      this.toNum(i.activosEspecifiqueOtros),
      totalActivos:                 this.toNum(i.totalActivos),

      pasivosDeudas:            this.toNum(i.pasivosDeudas),
      pasivosPrestamos:         this.toNum(i.pasivosPrestamos),
      pasivosOtros:             this.toNum(i.pasivosOtros),
      pasivosEspecifiqueOtros:  this.toStr(i.pasivosEspecifiqueOtros),
      totalPasivos:             this.toNum(i.totalPasivos),

      // SECCIÓN 6
      referenciasBancarias: i.referenciasBancarias,

      // SECCIÓN 7
      referenciasComerciales: i.referenciasComerciales,

      // SECCIÓN 8
      esPEP: this.toStr(i.esPEP).toLowerCase(),
      pepCargo: this.toStr(i.pepCargo),
      pepFuncionesSI: this.toStr(i.pepFuncionesSI).toLowerCase(),
      pepInstitucion: this.toStr(i.pepInstitucion),
      pepFechaCulminacion: this.toStr(i.pepFechaCulminacion),
      pepDireccion: this.toStr(i.pepDireccion),
      pepTelefono: this.toStr(i.pepTelefono),
      esFamiliarPEP: this.toStr(i.esFamiliarPEP).toLowerCase(),
      familiarPEPNombres: this.toStr(i.familiarPEPNombres),
      familiarPEPParentesco: this.toStr(i.familiarPEPParentesco),
      familiarPEPCargo: this.toStr(i.familiarPEPCargo),
      tieneRelacionPEP: this.toStr(i.tieneRelacionPEP).toLowerCase(),
      tipoRelacionPEP: this.toStr(i.tipoRelacionPEP).toLowerCase(),
      relacionPEPNombres: this.toStr(i.relacionPEPNombres),
      relacionPEPCargo: this.toStr(i.relacionPEPCargo),

      // SECCIÓN 9
      fondosTerceros: i.fondosTerceros,

      // SECCIÓN 10
      beneficiariosFinales: i.beneficiariosFinales,

      // SECCIÓN 11
      fondosProvenientesDe: this.toStr(i.fondosProvenientesDe),
      ciudadFecha:          this.toStr(i.ciudadFecha),
      clienteCI:            this.toStr(i.clienteCI),
      funcionarioNombre:    this.toStr(i.funcionarioNombre),
      funcionarioCI:        this.toStr(i.funcionarioCI),
      funcionarioCargo:     this.toStr(i.funcionarioCargo),

      // SECCIÓN 12
      doc12RUC:            i.doc12RUC            ?? false,
      doc12CertResidencia: i.doc12CertResidencia ?? false,
      doc12Cedula:         i.doc12Cedula         ?? false,
      doc12RolJubilacion:  i.doc12RolJubilacion  ?? false,
      doc12CertLaboral:    i.doc12CertLaboral     ?? false,
      doc12Planilla:       i.doc12Planilla        ?? false,
      doc12Representante:  i.doc12Representante   ?? false,
      doc12IVA:            i.doc12IVA             ?? false,
      doc12Renta:          i.doc12Renta           ?? false,
      doc12EstadosFinanc:  i.doc12EstadosFinanc   ?? false,
      doc12RefComercial:   i.doc12RefComercial    ?? false,
      doc12RefBancaria:    i.doc12RefBancaria      ?? false,

    };
  }

  private toStr(v: any): string {
    if (v === null || v === undefined) return '';
    return String(v).trim();
  }

  private toNum(v: any): string {
    if (v === null || v === undefined || v === '') return '0';
    const n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
    return isNaN(n) ? '0' : String(n);
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
      direccionDomicilio: { x: 125, y: 676, maxW: 295, size: 9 },
      telefono: { x: 370, y: 675, maxW: 148, size: 9 },
      profesion: { x: 150, y: 660, maxW: 140, size: 9 },
      email: { x: 370, y: 662, maxW: 148, size: 9 },

      // Agencia checkboxes
      agenciaGuayaquil: { x: 264, y: 647, size: 12 },
      agenciaQuito: { x: 264, y: 633, size: 12 },

      // Fondo checkboxes
      fondoSmartOne: { x: 379, y: 647, size: 12 },
      fondoAuranova: { x: 412, y: 647, size: 12 },
      fondoImpulso: { x: 506, y: 647, size: 12 },
      fondoQuito: { x: 350, y: 565, size: 12 },
      fondoAltoRendimiento: { x: 410, y: 565, size: 12 },

      // === SECCIÓN 2 ===
      // Ocupación checkboxes
      ocupacionIndependiente:{ x: 329, y: 582, size: 10 },
      ocupacionJubilacion:   { x: 379, y: 582, size: 10 },
      ocupacionAmaCasa:      { x: 411, y: 582, size: 10 },
      ocupacionEstudiante:   { x: 459, y: 582, size: 10 },
      ocupacionEmprendedor:  { x: 506, y: 582, size: 10 },

      // Cargo checkboxes
      cargoPublico: { x: 160, y: 582, size: 10 },
      cargoPrivado: { x: 264, y: 582, size: 10 },
      cargoCasan: { x: 506, y: 581, size: 12 },

      // Datos laborales
      nombreCompania: { x: 200, y: 568, maxW: 300, size: 9 },
      cargo: { x: 105, y: 553, maxW: 160, size: 9 },
      actividadEconomica: { x: 370, y: 549, maxW: 145, size: 8 },
      direccionLaboral: { x: 130, y: 537, maxW: 180, size: 9 },
      ciudadLaboral: { x: 370, y: 536, maxW: 140, size: 9 },
      telefonoLaboral: { x: 130, y: 523, maxW: 140, size: 9 },
      emailLaboral: { x: 370, y: 523, maxW: 140, size: 9 },

      // === SECCIÓN 3 ===
      representanteNombre: { x: 180, y: 487, maxW: 200, size: 9 },
      representanteIdentificacion: { x: 450, y: 487, maxW: 130, size: 9 },
      representanteDireccion: { x: 180, y: 472, maxW: 200, size: 9 },
      representanteNacionalidad: { x: 430, y: 472, maxW: 130, size: 9 },
      representanteEmail: { x: 180, y: 458, maxW: 200, size: 8 },
      representanteTelefono: { x: 430, y: 457, maxW: 130, size: 9 },

      // === SECCIÓN 4 ===
      conyugeNombre: { x: 130, y: 423, maxW: 180, size: 9 },
      conyugeIdentificacion: { x: 365, y: 425, maxW: 100, size: 7 },
      conyugeNacionalidad: { x: 443, y: 423, maxW: 120, size: 9 },
      conyugeGeneroMasculino: { x: 173, y: 408, size: 12 },
      conyugeGeneroFemenino: { x: 228, y: 408, size: 12 },
      conyugeEstadoCivilCasado: { x: 379, y: 408, size: 12 },
      conyugeEstadoCivilUnion: { x: 412, y: 408, size: 12 },
      conyugeProfesion: { x: 150, y: 395, maxW: 160, size: 9 },
      conyugeActividadEconomica: { x: 370, y: 395, maxW: 145, size: 9 },
      conyugeDireccion: { x: 150, y: 378, maxW: 160, size: 9 },
      conyugeEmail: { x: 150, y: 365, maxW: 160, size: 8 },
      conyugeTelefono: { x: 370, y: 365, maxW: 130, size: 9 },

      // === SECCIÓN 5 ===
      unidadEmpresaSi1: { x: 228, y: 311, size: 10 },
      unidadEmpresaNo1: { x: 306, y: 311, size: 10 },
      unidadEmpresaSi2: { x: 435, y: 311, size: 10 },
      unidadEmpresaNo2: { x: 482, y: 311, size: 10 },

      // Ingresos
      ingresosSalario: { x: 120, y: 279, maxW: 75, size: 8 },
      ingresosHonorarios: { x: 120, y: 262, maxW: 75, size: 8 },
      ingresosNegocioPropio: { x: 120, y: 240, maxW: 75, size: 8 },
      ingresosOtros: { x: 120, y: 209, maxW: 75, size: 8 },
      ingresosEspecifiqueOtros: { x: 470, y: 195, maxW: 100, size: 7 },
      totalIngresos: { x: 120, y: 180, maxW: 75, size: 8 },

      // Gastos (columna aproximadamente x: 200)
      gastosAlimentacion: { x: 202, y: 275, maxW: 75, size: 8 },
      gastosEducacion: { x: 202, y: 259, maxW: 75, size: 8 },
      gastosSalud: { x: 202, y: 247, maxW: 75, size: 8 },
      gastosVivienda: { x: 202, y: 232, maxW: 75, size: 8 },
      gastosOtros: { x: 202, y: 210, maxW: 75, size: 8 },
      gastosEspecifiqueOtros: { x: 470, y: 260, maxW: 100, size: 5 },
      totalGastos: { x: 202, y: 180, maxW: 75, size: 8 },

      // Activos (columna aproximadamente x: 300)
      activosVehiculo: { x: 295, y: 285, maxW: 75, size: 6 },
      activosCuentaPorCobrar: { x: 295, y: 275, maxW: 75, size: 6 },
      activosInversiones: { x: 295, y: 265, maxW: 75, size: 6 },
      activosAcciones: { x: 295, y: 250, maxW: 75, size: 6 },
      activosDerechosFiduciarios: { x: 295, y: 235, maxW: 75, size: 6 },
      activosOtros: { x: 295, y: 215, maxW: 75, size: 6 },
      activosEspecifiqueOtros: { x: 295, y: 198, maxW: 100, size: 6 },
      totalActivos: { x: 295, y: 180, maxW: 100, size: 6 },

      // Pasivos (columna aproximadamente x: 400)
      pasivosDeudas: { x: 380, y: 275, maxW: 100, size: 6 },
      pasivosPrestamos: { x: 380, y: 245, maxW: 75, size: 6 },
      pasivosOtros: { x: 380, y: 210, maxW: 75, size: 6 },
      totalPasivos: { x: 380, y: 180, maxW: 100, size: 6 },

      // === SECCIÓN 7 ===
      refComercial1Nombre:   { x: 80,  y: 28, maxW: 240, size: 9 },
      refComercial1Contacto: { x: 300, y: 28, maxW: 130, size: 9 },
      refComercial1Telefono: { x: 440, y: 28, maxW: 110, size: 9 },

    };
    // === SECCIÓN 6 ===
    const REF_POSITIONS = [
      {
        banco: { x: 80, y: 120, maxW: 220, size: 9 },
        tipoCuenta: { x: 300, y: 120, maxW: 80, size: 9 },
        numero: { x: 395, y: 120, maxW: 160, size: 9 },
      },
      {
        banco: { x: 80, y: 105, maxW: 220, size: 9 },
        tipoCuenta: { x: 300, y: 105, maxW: 80, size: 9 },
        numero: { x: 395, y: 105, maxW: 160, size: 9 },
      },
      {
        banco: { x: 80, y: 90, maxW: 220, size: 9 },
        tipoCuenta: { x: 300, y: 90, maxW: 80, size: 9 },
        numero: { x: 395, y: 90, maxW: 160, size: 9 },
      },
    ];

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
    if (ocupacion.includes('independiente')) {
      this.drawText(page, 'X', { ...POS.ocupacionIndependiente, font: fontBold }, color);
    } else if (ocupacion.includes('jubilac') || ocupacion.includes('jubilad')) {
      this.drawText(page, 'X', { ...POS.ocupacionJubilacion, font: fontBold }, color);
    } else if (ocupacion.includes('ama') || ocupacion.includes('casa')) {
      this.drawText(page, 'X', { ...POS.ocupacionAmaCasa, font: fontBold }, color);
    } else if (ocupacion.includes('estudiante')) {
      this.drawText(page, 'X', { ...POS.ocupacionEstudiante, font: fontBold }, color);
    } else if (ocupacion.includes('emprendedor')) {
      this.drawText(page, 'X', { ...POS.ocupacionEmprendedor, font: fontBold }, color);
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
    this.drawText(page, data.nombreCompania || '',     { ...POS.nombreCompania,     font }, color);
    this.drawText(page, data.cargo || '',              { ...POS.cargo,              font }, color);
    this.drawText(page, data.actividadEconomica || '', { ...POS.actividadEconomica, font }, color);
    this.drawText(page, data.direccionLaboral || '',   { ...POS.direccionLaboral,   font }, color);
    this.drawText(page, data.ciudadLaboral || '',      { ...POS.ciudadLaboral,      font }, color);
    this.drawText(page, data.telefonoLaboral || '',    { ...POS.telefonoLaboral,    font }, color);
    this.drawText(page, data.emailLaboral || '',       { ...POS.emailLaboral,       font }, color);

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
      data.totalPasivos || "",
      { ...POS.totalPasivos, font: fontBold },
      color,
    );

    // === SECCIÓN 6 ===
    const refs = (data.referenciasBancarias ?? []).slice(0, 3);
    refs.forEach((ref, i) => {
      const pos = REF_POSITIONS[i];
      this.drawText(page, ref.nombreIdentificacion ?? '', { ...pos.banco, font }, color);
      this.drawText(page, ref.tipoCuenta ?? '', { ...pos.tipoCuenta, font }, color);
      this.drawText(page, ref.numeroCuenta ?? '', { ...pos.numero, font }, color);
    });

    // === SECCIÓN 7 — fila 1 ===
    const refsComerciales = (data.referenciasComerciales ?? []).slice(0, 2);
    if (refsComerciales[0]) {
      this.drawText(page, refsComerciales[0].nombreRazonSocial ?? '', { ...POS.refComercial1Nombre,   font }, color);
      this.drawText(page, refsComerciales[0].personaContacto ?? '',   { ...POS.refComercial1Contacto, font }, color);
      this.drawText(page, refsComerciales[0].telefono ?? '',          { ...POS.refComercial1Telefono, font }, color);
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
      
      // === SECCIÓN 7 ===
      refComercial2Nombre:   { x: 80,  y: 805, maxW: 240, size: 9 },
      refComercial2Contacto: { x: 300, y: 805, maxW: 130, size: 9 },
      refComercial2Telefono: { x: 440, y: 805, maxW: 110, size: 9 },
      
      // === SECCIÓN 8.1 ===
      pepSi:           { x: 274, y: 771, size: 10 },
      pepNo:           { x: 292, y: 771, size: 10 },
      pepCargo:        { x: 160, y: 750, maxW: 155, size: 9 },
      pepFuncionesSI:  { x: 460, y: 754, size: 10 },
      pepFuncionesNO:  { x: 484, y: 754, size: 10 },
      pepInstitucion:  { x: 155, y: 737, maxW: 130, size: 9 },
      pepFecha:        { x: 370, y: 737, maxW: 140, size: 9 },
      pepDireccion:    { x: 155, y: 723, maxW: 130, size: 9 },
      pepTelefono:     { x: 370, y: 723, maxW: 140, size: 9 },

      // === SECCIÓN 8.2 ===
      familiarPepSi:        { x: 203, y: 709, size: 10 },
      familiarPepNo:        { x: 220, y: 709, size: 10 },
      familiarPepNombres:   { x: 230, y: 690, maxW: 200, size: 9 },
      familiarPepParentesco:{ x: 155, y: 678, maxW: 130, size: 9 },
      familiarPepCargo:     { x: 370, y: 678, maxW: 130, size: 9 },

      // === SECCIÓN 8.3 ===
      relacionPepSi:         { x: 184, y: 666, size: 8 },
      relacionPepNo:         { x: 199, y: 666, size: 8 },
      relacionPepComercial:  { x: 263, y: 666, size: 8 },
      relacionPepContractual:{ x: 295, y: 666, size: 8 },
      relacionPepLaboral:    { x: 318, y: 666, size: 8 },
      relacionPepOtra:       { x: 420, y: 666, size: 8 },
      relacionPepNombres:    { x: 160, y: 645, maxW: 200, size: 9 },
      relacionPepCargo:      { x: 380, y: 645, maxW: 130, size: 9 },

      // === SECCIÓN 9 ===
      fondoNombres: { x: 155, y: 610, maxW: 130, size: 9 },
      fondoIdentificacion: { x: 370, y: 610, maxW: 148, size: 9 },
      fondoNacionalidad: { x: 155, y: 595, maxW: 130, size: 9 },
      fondoPais: { x: 370, y: 595, maxW: 130, size: 9 },
      fondoProfesion: { x: 155, y: 581, maxW: 130, size: 9 },
      fondoTelefono: { x: 370, y: 581, maxW: 130, size: 9 },
      fondoDireccion: { x: 155, y: 567, maxW: 130, size: 9 },
      fondoActividad: { x: 400, y: 567, maxW: 148, size: 9 },

      // === SECCIÓN 11 ===
      fondosProvenientesDe: { x: 145, y: 297, maxW: 180, size: 9 },
      ciudadFecha:          { x: 85, y: 200, maxW: 180, size: 9 },
      clienteCI:            { x: 85, y: 173, maxW: 180, size: 9 },
      funcionarioNombre:    { x: 330, y: 200, maxW: 180, size: 9 },
      funcionarioCI:        { x: 330, y: 173, maxW: 70,  size: 9 },
      funcionarioCargo:     { x: 425, y: 173, maxW: 80,  size: 9 },

      // === SECCIÓN 12 ===
      doc12RUC:              { x: 490, y: 137, size: 8 },
      doc12CertResidencia:   { x: 490, y: 127, size: 8 },
      doc12Cedula:           { x: 490, y: 117, size: 8 },
      doc12RolJubilacion:    { x: 490, y: 108, size: 8 },
      doc12CertLaboral:      { x: 490, y: 98,  size: 8 },
      doc12Planilla:         { x: 490, y: 88,  size: 8 },
      doc12Representante:    { x: 490, y: 78,  size: 8 },
      doc12IVA:              { x: 490, y: 68,  size: 8 },
      doc12Renta:            { x: 490, y: 58,  size: 8 },
      doc12EstadosFinanc:    { x: 490, y: 49,  size: 8 },
      doc12RefComercial:     { x: 490, y: 39,  size: 8 },
      doc12RefBancaria:      { x: 490, y: 29,  size: 8 },

    };

    // === SECCIÓN 10  ===
    const BEN_POSITIONS = [
      {
        nombres: { x: 93, y: 519, maxW: 70, size: 8 },
        porcentaje: { x: 180, y: 519, maxW: 35, size: 8 },
        identificacion: { x: 240, y: 519, maxW: 70, size: 8 },
        nacionalidad: { x: 315, y: 519, maxW: 57, size: 8 },
        pais: { x: 380, y: 519, maxW: 50, size: 8 },
        parentesco: { x: 435, y: 519, maxW: 46, size: 8 },
        telefono: { x: 475, y: 519, maxW: 65, size: 7 },
      },
      {
        nombres: { x: 93, y: 505, maxW: 70, size: 8 },
        porcentaje: { x: 180, y: 505, maxW: 35, size: 8 },
        identificacion: { x: 240, y: 505, maxW: 70, size: 8 },
        nacionalidad: { x: 315, y: 505, maxW: 57, size: 8 },
        pais: { x: 380, y: 505, maxW: 50, size: 8 },
        parentesco: { x: 435, y: 505, maxW: 46, size: 8 },
        telefono: { x: 475, y: 505, maxW: 65, size: 7 },
      },

    ];

    // === SECCIÓN 7 — fila 2 ===
    const refsComerciales = (data.referenciasComerciales ?? []).slice(0, 2);
    if (refsComerciales[1]) {
      this.drawText(page, refsComerciales[1].nombreRazonSocial ?? '', { ...POS.refComercial2Nombre,   font }, color);
      this.drawText(page, refsComerciales[1].personaContacto ?? '',   { ...POS.refComercial2Contacto, font }, color);
      this.drawText(page, refsComerciales[1].telefono ?? '',          { ...POS.refComercial2Telefono, font }, color);
    }

    // === SECCIÓN 8.1 ===
    const esPEP = data.esPEP || '';
    if (esPEP.includes('si')) {
      this.drawText(page, 'X', { ...POS.pepSi, font: fontBold }, color);
    } else if (esPEP.includes('no')) {
      this.drawText(page, 'X', { ...POS.pepNo, font: fontBold }, color);
    }
    this.drawText(page, data.pepCargo || '',         { ...POS.pepCargo,       font }, color);
    const pepFunc = data.pepFuncionesSI || '';
    if (pepFunc.includes('si')) {
      this.drawText(page, 'X', { ...POS.pepFuncionesSI, font: fontBold }, color);
    } else if (pepFunc.includes('no')) {
      this.drawText(page, 'X', { ...POS.pepFuncionesNO, font: fontBold }, color);
    }
    this.drawText(page, data.pepInstitucion || '',      { ...POS.pepInstitucion, font }, color);
    this.drawText(page, data.pepFechaCulminacion || '', { ...POS.pepFecha,       font }, color);
    this.drawText(page, data.pepDireccion || '',        { ...POS.pepDireccion,   font }, color);
    this.drawText(page, data.pepTelefono || '',         { ...POS.pepTelefono,    font }, color);

    // === SECCIÓN 8.2 ===
    const esFamiliarPEP = data.esFamiliarPEP || '';
    if (esFamiliarPEP.includes('si')) {
      this.drawText(page, 'X', { ...POS.familiarPepSi, font: fontBold }, color);
    } else if (esFamiliarPEP.includes('no')) {
      this.drawText(page, 'X', { ...POS.familiarPepNo, font: fontBold }, color);
    }
    this.drawText(page, data.familiarPEPNombres || '',   { ...POS.familiarPepNombres,    font }, color);
    this.drawText(page, data.familiarPEPParentesco || '', { ...POS.familiarPepParentesco, font }, color);
    this.drawText(page, data.familiarPEPCargo || '',     { ...POS.familiarPepCargo,      font }, color);

    // === SECCIÓN 8.3 ===
    const tieneRelacionPEP = data.tieneRelacionPEP || '';
    if (tieneRelacionPEP.includes('si')) {
      this.drawText(page, 'X', { ...POS.relacionPepSi, font: fontBold }, color);
    } else if (tieneRelacionPEP.includes('no')) {
      this.drawText(page, 'X', { ...POS.relacionPepNo, font: fontBold }, color);
    }
    const tipoRelacion = data.tipoRelacionPEP || '';
    if (tipoRelacion.includes('comercial')) {
      this.drawText(page, 'X', { ...POS.relacionPepComercial,   font: fontBold }, color);
    }
    if (tipoRelacion.includes('contractual')) {
      this.drawText(page, 'X', { ...POS.relacionPepContractual, font: fontBold }, color);
    }
    if (tipoRelacion.includes('laboral')) {
      this.drawText(page, 'X', { ...POS.relacionPepLaboral,     font: fontBold }, color);
    }
    if (tipoRelacion.includes('otra')) {
      this.drawText(page, 'X', { ...POS.relacionPepOtra,        font: fontBold }, color);
    }
    this.drawText(page, data.relacionPEPNombres || '', { ...POS.relacionPepNombres, font }, color);
    this.drawText(page, data.relacionPEPCargo || '',   { ...POS.relacionPepCargo,   font }, color);

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
    const bens = (data.beneficiariosFinales ?? []).slice(0, 2);
    bens.forEach((ben, i) => {
      const pos = BEN_POSITIONS[i];
      this.drawText(page, ben.nombresCompletos ?? '',        { ...pos.nombres,        font }, color);
      this.drawText(page, ben.porcentajeParticipacion ?? '', { ...pos.porcentaje,     font }, color);
      this.drawText(page, ben.numeroIdentificacion ?? '',    { ...pos.identificacion, font }, color);
      this.drawText(page, ben.nacionalidad ?? '',            { ...pos.nacionalidad,   font }, color);
      this.drawText(page, ben.paisResidencia ?? '',          { ...pos.pais,           font }, color);
      this.drawText(page, ben.parentesco ?? '',              { ...pos.parentesco,     font }, color);
      this.drawText(page, ben.telefono ?? '',                { ...pos.telefono,       font }, color);
    });

    // === SECCIÓN 11 ===
    this.drawText(page, data.fondosProvenientesDe || '', { ...POS.fondosProvenientesDe, font }, color);
    this.drawText(page, data.ciudadFecha          || '', { ...POS.ciudadFecha,          font }, color);
    this.drawText(page, data.clienteCI            || '', { ...POS.clienteCI,            font }, color);
    this.drawText(page, data.funcionarioNombre    || '', { ...POS.funcionarioNombre,    font }, color);
    this.drawText(page, data.funcionarioCI        || '', { ...POS.funcionarioCI,        font }, color);
    this.drawText(page, data.funcionarioCargo     || '', { ...POS.funcionarioCargo,     font }, color);

    // === SECCIÓN 12 ===
    if (data.doc12RUC)            this.drawText(page, 'X', { ...POS.doc12RUC,            font: fontBold }, color);
    if (data.doc12CertResidencia) this.drawText(page, 'X', { ...POS.doc12CertResidencia, font: fontBold }, color);
    if (data.doc12Cedula)         this.drawText(page, 'X', { ...POS.doc12Cedula,         font: fontBold }, color);
    if (data.doc12RolJubilacion)  this.drawText(page, 'X', { ...POS.doc12RolJubilacion,  font: fontBold }, color);
    if (data.doc12CertLaboral)    this.drawText(page, 'X', { ...POS.doc12CertLaboral,    font: fontBold }, color);
    if (data.doc12Planilla)       this.drawText(page, 'X', { ...POS.doc12Planilla,       font: fontBold }, color);
    if (data.doc12Representante)  this.drawText(page, 'X', { ...POS.doc12Representante,  font: fontBold }, color);
    if (data.doc12IVA)            this.drawText(page, 'X', { ...POS.doc12IVA,            font: fontBold }, color);
    if (data.doc12Renta)          this.drawText(page, 'X', { ...POS.doc12Renta,          font: fontBold }, color);
    if (data.doc12EstadosFinanc)  this.drawText(page, 'X', { ...POS.doc12EstadosFinanc,  font: fontBold }, color);
    if (data.doc12RefComercial)   this.drawText(page, 'X', { ...POS.doc12RefComercial,   font: fontBold }, color);
    if (data.doc12RefBancaria)    this.drawText(page, 'X', { ...POS.doc12RefBancaria,    font: fontBold }, color);
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
