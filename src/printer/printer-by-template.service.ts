import { Injectable } from '@nestjs/common';
import { CreateAutorizacionCobroPdfBufferUseCase } from './use-cases/create-autorizacion-cobro-pdf-buffer.use-case';
import type { AutorizacionCobroData } from './use-cases/create-autorizacion-cobro-pdf-buffer.use-case';

@Injectable()
export class PrinterByTemplateService {
  constructor(
    private readonly createAutorizacionCobroPdfBufferUseCase: CreateAutorizacionCobroPdfBufferUseCase
  ) {}

  async createAutorizacionCobroPdfBuffer(
    input?: Partial<AutorizacionCobroData>,
  ): Promise<Buffer> {
    return this.createAutorizacionCobroPdfBufferUseCase.execute(input);
  }

  async createAutorizacionCobroPdfBufferFromData(
    data: AutorizacionCobroData,
  ): Promise<Buffer> {
    return this.createAutorizacionCobroPdfBufferUseCase.execute(data);
  }
}
