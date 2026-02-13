import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [PrismaModule, IngestionModule, AnalyticsModule],
})
export class AppModule {}
