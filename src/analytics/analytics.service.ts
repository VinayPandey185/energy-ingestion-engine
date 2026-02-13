import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getVehiclePerformance(vehicleId: string) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Vehicle side aggregation (DC + temperature)
    const vehicleAgg = await this.prisma.vehicleReadingHistory.aggregate({
      where: {
        vehicleId,
        timestamp: {
          gte: since,
        },
      },
      _sum: {
        kwhDeliveredDc: true,
      },
      _avg: {
        batteryTemp: true,
      },
    });

    // Meter side aggregation (AC)
    // Assumption: meterId === vehicleId
    const meterAgg = await this.prisma.meterReadingHistory.aggregate({
      where: {
        meterId: vehicleId,
        timestamp: {
          gte: since,
        },
      },
      _sum: {
        kwhConsumedAc: true,
      },
    });

    const totalDc = vehicleAgg._sum.kwhDeliveredDc ?? 0;
    const totalAc = meterAgg._sum.kwhConsumedAc ?? 0;

    const efficiency =
      totalAc > 0 ? Number((totalDc / totalAc).toFixed(2)) : null;

    return {
      vehicleId,
      last24Hours: {
        totalAcConsumed: totalAc,
        totalDcDelivered: totalDc,
        efficiencyRatio: efficiency,
        avgBatteryTemp: vehicleAgg._avg.batteryTemp,
      },
    };
  }
}
