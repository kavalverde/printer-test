import {
  Controller,
  Post,
  Body,
  Res,
  StreamableFile,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { PrinterByTemplateService } from './printer-by-template.service';
import { CreateConozcaSuClientePdfBufferUseCase } from './use-cases/create-conozca-su-cliente-pdf-buffer.use-case';

export class TestPdfDataDto {
  // HOJA 1
  ciudad?: string;
  dia?: string;
  mes?: string;
  anio?: string;
  fondo?: string;
  
  // HOJA 2 - Columna izquierda
  numeroInversion?: string;
  nombresCompletos?: string;
  identificacion?: string;
  nacionalidad?: string;
  pais?: string;
  estadoCivil?: string;
  direccion?: string;
  ciudadDir?: string;
  provincia?: string;
  canton?: string;
  parroquia?: string;
  telefono?: string;
  email?: string;
  
  // HOJA 2 - Columna derecha
  nombreRepresentanteLegal?: string;
  cargoRepresentanteLegal?: string;
  beneficiarios?: string;
  valorInversion?: string;
  fechaIncorporacion?: string;
  valorUnidad?: string;
  numeroUnidades?: string;
  entidadFinanciera?: string;
  tipoCuenta?: string;
  numeroCuenta?: string;
  
  // HOJA 9
  ciudadFirma?: string;
  diaFirma?: string;
  mesFirma?: string;
  anioFirma?: string;
  firmanteNombre?: string;
  firmanteIdentificacion?: string;
  
  // HOJA 13
  ciudadAnexo?: string;
  diaAnexo?: string;
  mesAnexo?: string;
  anioAnexo?: string;
  
  // HOJA 14
  debitoEntidadFinanciera?: string;
  debitoTipoCuenta?: string;
  debitoNumeroCuenta?: string;
  debitoAporteInicial?: string;
  debitoAporteRecurrente?: string;
  debitoPeriodicidad?: string;
  debitoDia?: string;
}

export class TestAutorizacionCobroPdfDataDto {
  // 1. Titular - persona natural
  nombreCompleto?: string;
  documentoIdentidad?: string;

  // 1.2 Persona jurídica (opcional)
  razonSocial?: string;
  ruc?: string;
  representanteNombre?: string;
  representanteCargo?: string;
  representanteDocumento?: string;

  // 2. Proveedor
  proveedorNombre?: string;
  proveedorRuc?: string;
  servicioContratado?: string;

  // 3. Forma de pago
  debitoCuenta?: boolean;
  cargoTarjeta?: boolean;
  tipoCuenta?: string;
  numeroCuenta?: string;
  numeroTarjeta?: string;
  fechaCaducidad?: string;
  cvv?: string;

  // Periodicidad
  periodicidadUnico?: boolean;
  periodicidadMensual?: boolean;
  periodicidadAnual?: boolean;
  periodicidadOtra?: boolean;
  periodicidadOtraTexto?: string;

  // 5. Firma
  lugarFirma?: string;
  fechaFirma?: string;
}

export class TestConozcaSuClientePNDto {
  // === SECCIÓN 1: INFORMACIÓN DEL CLIENTE ===
  nombresApellidos?: string;
  tipoIdentificacion?: string; // "cedula", "pasaporte", "ruc"
  numeroIdentificacion?: string;
  ciudad?: string;
  pasaporte?: string;
  genero?: string; // "masculino", "femenino"
  estadoCivil?: string; // "soltero", "casado", "union", "divorciado", "viudo"
  nacionalidad?: string;
  fechaNacimiento?: string;
  lugarNacimiento?: string;
  ciudadResidencia?: string;
  provincia?: string;
  canton?: string;
  parroquia?: string;
  direccionDomicilio?: string;
  telefono?: string;
  profesion?: string;
  email?: string;
  agencia?: string; // "guayaquil", "quito"
  fondo?: string; // "smart-one", "auranova", "impulso", "quito", "alto rendimiento"

  // === SECCIÓN 2: INFORMACIÓN LABORAL ===
  ocupacion?: string; // "dependiente", "independiente", "ama de casa", "jubilacion", "estudiante", "emprendedor"
  cargoTipo?: string; // "publico", "privado", "casan"
  nombreCompania?: string;
  cargo?: string;
  actividadEconomica?: string;
  direccionLaboral?: string;
  ciudadLaboral?: string;
  telefonoLaboral?: string;
  emailLaboral?: string;

  // === SECCIÓN 3: REPRESENTANTE LEGAL ===
  representanteNombre?: string;
  representanteIdentificacion?: string;
  representanteDireccion?: string;
  representanteNacionalidad?: string;
  representanteEmail?: string;
  representanteTelefono?: string;

  // === SECCIÓN 4: CÓNYUGE ===
  conyugeNombre?: string;
  conyugeIdentificacion?: string;
  conyugeNacionalidad?: string;
  conyugeGenero?: string; // "masculino", "femenino"
  conyugeEstadoCivil?: string; // "casado", "union"
  conyugeProfesion?: string;
  conyugeActividadEconomica?: string;
  conyugeDireccion?: string;
  conyugeEmail?: string;
  conyugeTelefono?: string;

  // === SECCIÓN 5: INFORMACIÓN FINANCIERA ===
  unidadEmpresa?: string; // "si", "no"
  
  // Ingresos
  ingresosSalario?: string;
  ingresosHonorarios?: string;
  ingresosNegocioPropio?: string;
  ingresosOtros?: string;
  ingresosEspecifiqueOtros?: string;
  totalIngresos?: string;
  
  // Gastos
  gastosAlimentacion?: string;
  gastosEducacion?: string;
  gastosSalud?: string;
  gastosVivienda?: string;
  gastosOtros?: string;
  gastosEspecifiqueOtros?: string;
  totalGastos?: string;
  
  // Activos
  activosVehiculo?: string;
  activosCuentaPorCobrar?: string;
  activosInversiones?: string;
  activosAcciones?: string;
  activosDerechosFiduciarios?: string;
  activosOtros?: string;
  activosEspecifiqueOtros?: string;
  totalActivos?: string;
  
  // Pasivos
  pasivosDeudas?: string;
  pasivosPrestamos?: string;
  pasivosOtros?: string;
  pasivosEspecifiqueOtros?: string;
  totalPasivos?: string;

  // === SECCIÓN 6: REFERENCIAS BANCARIAS ===
  referenciasBancarias?: ReferenciaBancariaDto[];

  // === SECCIÓN 8: DECLARACIÓN PEP ===
  esPEP?: string; // "si", "no"
  pepPais?: string;
  pepInstitucion?: string;
  pepFechaCumplimiento?: string;
  pepDireccion?: string;
  pepTelefono?: string;
  
  esFamiliarPEP?: string; // "si", "no"
  familiarPEPNombres?: string;
  familiarPEPParentesco?: string;
  familiarPEPCampo?: string;
  
  tieneRelacionPEP?: string; // "si", "no"
  tipoRelacionPEP?: string; // "comercial", "contractual", "laboral", "asociado"
  relacionPEPNombres?: string;

  // === SECCIÓN 9: FONDOS PROVENIENTES DE TERCEROS ===
  fondosTerceros?: FondoTerceroDto[];

  // === SECCIÓN 10: BENEFICIARIO FINAL ===
  beneficiariosFinales?: BeneficiarioFinalDto[];
}

export class ReferenciaBancariaDto {
  nombreIdentificacion?: string;
  tipoCuenta?: string; // "ahorros", "corriente"
  numeroCuenta?: string;
}

export class FondoTerceroDto {
  nombresCompletos?: string;
  numeroIdentificacion?: string;
  nacionalidad?: string;
  paisResidencia?: string;
  profesion?: string;
  telefono?: string;
  direccionDomicilio?: string;
  actividadEconomica?: string;
}

export class BeneficiarioFinalDto {
  nombresCompletos?: string;
  porcentajeParticipacion?: string;
  numeroIdentificacion?: string;
  nacionalidad?: string;
  paisResidencia?: string;
  parentesco?: string;
  telefono?: string;
}

@Controller('printer/test')
export class PrinterTestController {
  constructor(
    private readonly printerByTemplateService: PrinterByTemplateService,
    private readonly createConozcaSuClientePdfBufferUseCase: CreateConozcaSuClientePdfBufferUseCase,
  ) {}

  @Post('autorizacion-cobro-pdf')
  async generateAutorizacionCobroTestPdf(
    @Body() data: TestAutorizacionCobroPdfDataDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const defaultData = {
      nombreCompleto: data.nombreCompleto || 'JUAN CARLOS PÉREZ GONZÁLEZ',
      documentoIdentidad: data.documentoIdentidad || '0912345678',
      razonSocial: data.razonSocial || 'testing S.A.',
      ruc: data.ruc || '123213123213',
      representanteNombre: data.representanteNombre || 'testing',
      representanteCargo: data.representanteCargo || 'testing',
      representanteDocumento: data.representanteDocumento || '1234567890',
      proveedorNombre: data.proveedorNombre || 'SMARTFONDOS S.A.',
      proveedorRuc: data.proveedorRuc || '0999999999001',
      servicioContratado: data.servicioContratado || 'Inversión Fondo Smart',
      debitoCuenta: data.debitoCuenta ?? true,
      cargoTarjeta: data.cargoTarjeta ?? true,
      tipoCuenta: data.tipoCuenta || 'Corriente',
      numeroCuenta: data.numeroCuenta || '1234567890',
      numeroTarjeta: data.numeroTarjeta || '123543567547',
      fechaCaducidad: data.fechaCaducidad || '12/28',
      cvv: data.cvv || '123',
      periodicidadUnico: data.periodicidadUnico ?? true,
      periodicidadMensual: data.periodicidadMensual ?? true,
      periodicidadAnual: data.periodicidadAnual ?? true,
      periodicidadOtra: data.periodicidadOtra ?? true,
      periodicidadOtraTexto: data.periodicidadOtraTexto || '15 de cada mes',
      lugarFirma: data.lugarFirma || 'Guayaquil',
      fechaFirma: data.fechaFirma || '25/02/2026',
    };

    console.log('Datos recibidos para Autorización de Cobro PDF:', data);

    const pdfBuffer =
      await this.printerByTemplateService.createAutorizacionCobroPdfBuffer(
        defaultData,
      );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="autorizacion-cobro-test-${Date.now()}.pdf"`,
    });

    return new StreamableFile(pdfBuffer);
  }
  // DTO para Conozca su Cliente - Persona Natura

// En el mismo controller, agrega este endpoint:

@Post('conozca-cliente-pdf')
async generateConozcaClienteTestPdf(
  @Body() data: TestConozcaSuClientePNDto = {},
  @Res({ passthrough: true }) res: Response,
): Promise<StreamableFile> {
  // Valores por defecto para todos los campos
  const defaultData = {
    // SECCIÓN 1
    nombresApellidos: data?.nombresApellidos || 'JUAN CARLOS PÉREZ GONZÁLEZ',
    tipoIdentificacion: data?.tipoIdentificacion || 'ruc',
    numeroIdentificacion: data?.numeroIdentificacion || '1718975251',
    ciudad: data?.ciudad || 'Guayaquil',
    pasaporte: data?.pasaporte || '',
    genero: data?.genero || 'femenino',
    estadoCivil: data?.estadoCivil || 'viud',
    nacionalidad: data?.nacionalidad || 'Ecuatoriana',
    fechaNacimiento: data?.fechaNacimiento || '15/05/1985',
    lugarNacimiento: data?.lugarNacimiento || 'Guayaquil',
    ciudadResidencia: data?.ciudadResidencia || 'Guayaquil',
    provincia: data?.provincia || 'Guayas',
    canton: data?.canton || 'Guayaquil',
    parroquia: data?.parroquia || 'Tarqui',
    direccionDomicilio: data?.direccionDomicilio || 'Av. Principal 123 y Calle Secundaria',
    telefono: data?.telefono || '0991234567',
    profesion: data?.profesion || 'Ingeniero Comercial',
    email: data?.email || 'juan.perez@email.com',
    agencia: data?.agencia || 'guayaquil',
    fondo: data?.fondo || 'smart-one',

    // SECCIÓN 2
    ocupacion: data?.ocupacion || 'dependiente',
    cargoTipo: data?.cargoTipo || 'privado',
    nombreCompania: data?.nombreCompania || 'Empresa XYZ S.A.',
    cargo: data?.cargo || 'Gerente Financiero',
    actividadEconomica: data?.actividadEconomica || 'Servicios Financieros',
    direccionLaboral: data?.direccionLaboral || 'Av. Empresarial 456',
    ciudadLaboral: data?.ciudadLaboral || 'Guayaquil',
    telefonoLaboral: data?.telefonoLaboral || '042345678',
    emailLaboral: data?.emailLaboral || 'juan.perez@empresa.com',

    // SECCIÓN 3
    representanteNombre: data?.representanteNombre || '',
    representanteIdentificacion: data?.representanteIdentificacion || '',
    representanteDireccion: data?.representanteDireccion || '',
    representanteNacionalidad: data?.representanteNacionalidad || '',
    representanteEmail: data?.representanteEmail || '',
    representanteTelefono: data?.representanteTelefono || '',

    // SECCIÓN 4
    conyugeNombre: data?.conyugeNombre || 'MARÍA FERNANDA LÓPEZ DE PÉREZ',
    conyugeIdentificacion: data?.conyugeIdentificacion || '0912345679',
    conyugeNacionalidad: data?.conyugeNacionalidad || 'Ecuatoriana',
    conyugeGenero: data?.conyugeGenero || 'femenino',
    conyugeEstadoCivil: data?.conyugeEstadoCivil || 'casado',
    conyugeProfesion: data?.conyugeProfesion || 'Abogada',
    conyugeActividadEconomica: data?.conyugeActividadEconomica || 'Consultoría Legal',
    conyugeDireccion: data?.conyugeDireccion || 'Av. Principal 123',
    conyugeEmail: data?.conyugeEmail || 'maria.lopez@email.com',
    conyugeTelefono: data?.conyugeTelefono || '0987654321',

    // SECCIÓN 5
    unidadEmpresa: data?.unidadEmpresa || 'no',
    
    ingresosSalario: data?.ingresosSalario || '3000.00',
    ingresosHonorarios: data?.ingresosHonorarios || '500.00',
    ingresosNegocioPropio: data?.ingresosNegocioPropio || '',
    ingresosOtros: data?.ingresosOtros || '200.00',
    ingresosEspecifiqueOtros: data?.ingresosEspecifiqueOtros || 'Dividendos',
    totalIngresos: data?.totalIngresos || '3700.00',
    
    gastosAlimentacion: data?.gastosAlimentacion || '500.00',
    gastosEducacion: data?.gastosEducacion || '300.00',
    gastosSalud: data?.gastosSalud || '200.00',
    gastosVivienda: data?.gastosVivienda || '800.00',
    gastosOtros: data?.gastosOtros || '400.00',
    gastosEspecifiqueOtros: data?.gastosEspecifiqueOtros || 'Transporte, entretenimiento',
    totalGastos: data?.totalGastos || '2200.00',
    
    activosVehiculo: data?.activosVehiculo || '15000.00',
    activosCuentaPorCobrar: data?.activosCuentaPorCobrar || '1000.00',
    activosInversiones: data?.activosInversiones || '5000.00',
    activosAcciones: data?.activosAcciones || '2000.00',
    activosDerechosFiduciarios: data?.activosDerechosFiduciarios || '',
    activosOtros: data?.activosOtros || '3000.00',
    activosEspecifiqueOtros: data?.activosEspecifiqueOtros || 'Ahorros',
    totalActivos: data?.totalActivos || '26000.00',
    
    pasivosDeudas: data?.pasivosDeudas || '5000.00',
    pasivosPrestamos: data?.pasivosPrestamos || '10000.00',
    pasivosOtros: data?.pasivosOtros || '1000.00',
    pasivosEspecifiqueOtros: data?.pasivosEspecifiqueOtros || 'Tarjeta de crédito',
    totalPasivos: data?.totalPasivos || '16000.00',

    // SECCIÓN 6
    referenciasBancarias: data?.referenciasBancarias || [
      {
        nombreIdentificacion: 'Banco Pichincha',
        tipoCuenta: 'ahorros',
        numeroCuenta: '1234567890'
      }
    ],

    // SECCIÓN 8
    esPEP: data?.esPEP || 'no',
    pepPais: data?.pepPais || '',
    pepInstitucion: data?.pepInstitucion || '',
    pepFechaCumplimiento: data?.pepFechaCumplimiento || '',
    pepDireccion: data?.pepDireccion || '',
    pepTelefono: data?.pepTelefono || '',
    
    esFamiliarPEP: data?.esFamiliarPEP || 'no',
    familiarPEPNombres: data?.familiarPEPNombres || '',
    familiarPEPParentesco: data?.familiarPEPParentesco || '',
    familiarPEPCampo: data?.familiarPEPCampo || '',
    
    tieneRelacionPEP: data?.tieneRelacionPEP || 'no',
    tipoRelacionPEP: data?.tipoRelacionPEP || '',
    relacionPEPNombres: data?.relacionPEPNombres || '',

    // SECCIÓN 9
    fondosTerceros: data?.fondosTerceros || [],

    // SECCIÓN 10
    beneficiariosFinales: data?.beneficiariosFinales || [
      {
        nombresCompletos: 'PEDRO PÉREZ',
        porcentajeParticipacion: '50%',
        numeroIdentificacion: '0912345680',
        nacionalidad: 'Ecuatoriana',
        paisResidencia: 'Ecuador',
        parentesco: 'Hijo',
        telefono: '0998765432'
      },
      {
        nombresCompletos: 'ANA PÉREZ',
        porcentajeParticipacion: '50%',
        numeroIdentificacion: '0912345681',
        nacionalidad: 'Ecuatoriana',
        paisResidencia: 'Ecuador',
        parentesco: 'Hija',
        telefono: '0998765433'
      }
    ],
  };

  console.log('Datos recibidos para Conozca su Cliente PDF:', data);

  const pdfBuffer =
    await this.createConozcaSuClientePdfBufferUseCase.execute(
      defaultData,
    );

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="conozca-cliente-test-${Date.now()}.pdf"`,
  });

  return new StreamableFile(pdfBuffer);
}
}