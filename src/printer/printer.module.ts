import { Module } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { PrinterByTemplateService } from './printer-by-template.service';
import { PrinterTestController } from './printer-test.controller';
import { CreateAutorizacionCobroPdfBufferUseCase } from './use-cases/create-autorizacion-cobro-pdf-buffer.use-case';
import { CreateConozcaSuClientePdfBufferUseCase } from './use-cases/create-conozca-su-cliente-pdf-buffer.use-case';

@Module({
  controllers: [PrinterTestController],
  providers: [
    PrinterService,
    PrinterByTemplateService,
    CreateAutorizacionCobroPdfBufferUseCase,
    CreateConozcaSuClientePdfBufferUseCase,
  ],
  exports: [PrinterService, PrinterByTemplateService],
})
export class PrinterModule {}
