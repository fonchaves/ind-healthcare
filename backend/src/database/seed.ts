import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  try {
    // Use partial data by default (pass true for full data in production)
    const useFullData = process.env.USE_FULL_DATA === 'true';

    console.log(
      `Starting seed with ${useFullData ? 'FULL' : 'PARTIAL'} dataset...`,
    );
    await seedService.seedAllFiles(useFullData);
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
