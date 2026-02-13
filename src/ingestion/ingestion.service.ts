import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeterDto } from './dto/meter.dto';
import { VehicleDto } from './dto/vehicle.dto';

@Injectable()
export class IngestionService {
  constructor(private readonly prisma: PrismaService) {}

  async ingestMeter(dto: MeterDto) {
    await this.prisma.meterReadingHistory.create({
      data: {
        meterId: dto.meterId,
        kwhConsumedAc: dto.kwhConsumedAc,
        voltage: dto.voltage,
        timestamp: new Date(dto.timestamp),
      },
    });

    await this.prisma.meterLiveStatus.upsert({
      where: { meterId: dto.meterId },
      update: {
        lastKwhConsumedAc: dto.kwhConsumedAc,
        lastVoltage: dto.voltage,
        lastTimestamp: new Date(dto.timestamp),
      },
      create: {
        meterId: dto.meterId,
        lastKwhConsumedAc: dto.kwhConsumedAc,
        lastVoltage: dto.voltage,
        lastTimestamp: new Date(dto.timestamp),
      },
    });

    return { status: 'meter_ingested' };
  }

  async ingestVehicle(dto: VehicleDto) {
    await this.prisma.vehicleReadingHistory.create({
      data: {
        vehicleId: dto.vehicleId,
        soc: dto.soc,
        kwhDeliveredDc: dto.kwhDeliveredDc,
        batteryTemp: dto.batteryTemp,
        timestamp: new Date(dto.timestamp),
      },
    });

    await this.prisma.vehicleLiveStatus.upsert({
      where: { vehicleId: dto.vehicleId },
      update: {
        soc: dto.soc,
        lastKwhDeliveredDc: dto.kwhDeliveredDc,
        lastBatteryTemp: dto.batteryTemp,
        lastTimestamp: new Date(dto.timestamp),
      },
      create: {
        vehicleId: dto.vehicleId,
        soc: dto.soc,
        lastKwhDeliveredDc: dto.kwhDeliveredDc,
        lastBatteryTemp: dto.batteryTemp,
        lastTimestamp: new Date(dto.timestamp),
      },
    });

    return { status: 'vehicle_ingested' };
  }
}
