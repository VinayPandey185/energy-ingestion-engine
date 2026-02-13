import { Body, Controller, Post } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { MeterDto } from './dto/meter.dto';
import { VehicleDto } from './dto/vehicle.dto';

@Controller('v1/ingest')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  async ingest(@Body() payload: any) {
    if (payload.meterId) {
      return this.ingestionService.ingestMeter(payload as MeterDto);
    }

    if (payload.vehicleId) {
      return this.ingestionService.ingestVehicle(payload as VehicleDto);
    }

    return { message: 'Invalid payload' };
  }
}
