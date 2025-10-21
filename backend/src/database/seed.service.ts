import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

interface CsvRow {
  NU_NOTIFIC: string;
  DT_NOTIFIC: string;
  SEM_NOT: string;
  ID_MUNICIP: string;
  SG_UF_NOT: string;
  CO_MUN_NOT: string;
  SG_UF: string;
  CO_MUN_RES: string;
  CS_SEXO: string;
  NU_IDADE_N: string;
  TP_IDADE: string;
  HOSPITAL: string;
  DT_INTERNA: string;
  UTI: string;
  DT_ENTUTI: string;
  VACINA_COV: string;
  DOSE_1_COV: string;
  DOSE_2_COV: string;
  EVOLUCAO: string;
  DT_EVOLUCA: string;
}

interface SragRecord {
  notificationId: string;
  notificationDate: Date;
  weekNumber: number | null;
  state: string;
  stateResidence: string | null;
  municipality: string | null;
  municipalityName: string | null;
  municipalityRes: string | null;
  sex: string | null;
  ageYears: number | null;
  ageType: number | null;
  hospitalized: boolean;
  hospitalDate: Date | null;
  icu: boolean;
  icuEntryDate: Date | null;
  vaccinated: boolean;
  dose1Date: Date | null;
  dose2Date: Date | null;
  evolution: string | null;
  evolutionDate: Date | null;
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private prisma: PrismaService) {}

  async seedFromCsv(filePath: string): Promise<number> {
    this.logger.log(`Starting to import data from ${filePath}`);

    const records: SragRecord[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row: CsvRow) => {
          try {
            const record = this.transformRow(row);
            if (record) {
              records.push(record);
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            this.logger.warn(`Error transforming row: ${errorMessage}`);
          }
        })
        .on('end', () => {
          // Use immediately invoked async function to handle promises properly
          void (async () => {
            try {
              this.logger.log(
                `Parsed ${records.length} records, inserting into database...`,
              );

              // Insert in batches to avoid memory issues
              const batchSize = 100;
              let insertedCount = 0;

              for (let i = 0; i < records.length; i += batchSize) {
                const batch = records.slice(i, i + batchSize);
                await this.prisma.sragCase.createMany({
                  data: batch,
                  skipDuplicates: true,
                });
                insertedCount += batch.length;
                this.logger.log(
                  `Inserted ${insertedCount}/${records.length} records`,
                );
              }

              this.logger.log(
                `Successfully imported ${insertedCount} records from ${filePath}`,
              );
              resolve(insertedCount);
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
              this.logger.error(`Error inserting records: ${errorMessage}`);
              reject(
                error instanceof Error
                  ? error
                  : new Error('Unknown error occurred'),
              );
            }
          })();
        })
        .on('error', (error: Error) => {
          this.logger.error(`Error reading CSV: ${error.message}`);
          reject(error);
        });
    });
  }

  private transformRow(row: CsvRow): SragRecord | null {
    try {
      // Skip rows without essential data
      if (!row.NU_NOTIFIC || !row.DT_NOTIFIC || !row.SG_UF_NOT) {
        return null;
      }

      const notificationDate = this.parseDate(row.DT_NOTIFIC);
      if (!notificationDate) {
        return null;
      }

      const state = this.cleanString(row.SG_UF_NOT);
      if (!state) {
        return null;
      }

      return {
        notificationId: row.NU_NOTIFIC.replace(/"/g, ''),
        notificationDate,
        weekNumber: this.parseNumber(row.SEM_NOT),
        state,
        stateResidence: this.cleanString(row.SG_UF),
        municipality: this.cleanString(row.CO_MUN_NOT),
        municipalityName: this.cleanString(row.ID_MUNICIP),
        municipalityRes: this.cleanString(row.CO_MUN_RES),
        sex: this.cleanString(row.CS_SEXO),
        ageYears: this.calculateAgeInYears(row.NU_IDADE_N, row.TP_IDADE),
        ageType: this.parseNumber(row.TP_IDADE),
        hospitalized: row.HOSPITAL === '1',
        hospitalDate: this.parseDate(row.DT_INTERNA),
        icu: row.UTI === '1',
        icuEntryDate: this.parseDate(row.DT_ENTUTI),
        vaccinated: row.VACINA_COV === '1' || row.VACINA_COV === '2',
        dose1Date: this.parseDate(row.DOSE_1_COV),
        dose2Date: this.parseDate(row.DOSE_2_COV),
        evolution: this.cleanString(row.EVOLUCAO),
        evolutionDate: this.parseDate(row.DT_EVOLUCA),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error transforming row: ${errorMessage}`);
      return null;
    }
  }

  private cleanString(value: string): string | null {
    if (!value || value === '""' || value === '') return null;
    return value.replace(/"/g, '').trim();
  }

  private parseNumber(value: string): number | null {
    if (!value || value === '""' || value === '') return null;
    const cleaned = value.replace(/"/g, '').trim();
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? null : parsed;
  }

  private parseDate(value: string): Date | null {
    if (!value || value === '""' || value === '') return null;
    const cleaned = value.replace(/"/g, '').trim();

    // Try parsing DD/MM/YYYY format
    if (cleaned.includes('/')) {
      const [day, month, year] = cleaned.split('/');
      const date = new Date(`${year}-${month}-${day}`);
      return isNaN(date.getTime()) ? null : date;
    }

    // Try parsing YYYY-MM-DD format
    const date = new Date(cleaned);
    return isNaN(date.getTime()) ? null : date;
  }

  private calculateAgeInYears(
    ageValue: string,
    ageType: string,
  ): number | null {
    const age = this.parseNumber(ageValue);
    const type = this.parseNumber(ageType);

    if (age === null || type === null) return null;

    // TP_IDADE: 1=dias, 2=meses, 3=anos
    switch (type) {
      case 1: // dias
        return Math.floor(age / 365);
      case 2: // meses
        return Math.floor(age / 12);
      case 3: // anos
        return age;
      default:
        return null;
    }
  }

  /**
   * Seeds database from CSV files
   * @param useFullData - If true, uses full dataset from 'full' folder, otherwise uses 'partial' folder for development
   */
  async seedAllFiles(useFullData: boolean = false): Promise<void> {
    const dataFolder = useFullData ? 'full' : 'partial';
    const dataPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'docs',
      'datasource',
      dataFolder,
    );

    this.logger.log(`Starting to seed database from ${dataFolder} dataset...`);

    // Check if directory exists
    if (!fs.existsSync(dataPath)) {
      this.logger.error(`Data directory not found: ${dataPath}`);
      throw new Error(`Data directory not found: ${dataPath}`);
    }

    // Read all CSV files in the directory
    const files = fs
      .readdirSync(dataPath)
      .filter((file) => file.endsWith('.csv'))
      .sort(); // Sort to process in order

    if (files.length === 0) {
      this.logger.warn(`No CSV files found in ${dataPath}`);
      return;
    }

    this.logger.log(`Found ${files.length} CSV files to process`);

    let totalRecords = 0;
    for (const file of files) {
      const filePath = path.join(dataPath, file);
      try {
        const count = await this.seedFromCsv(filePath);
        totalRecords += count;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Error processing file ${file}: ${errorMessage}`);
      }
    }

    this.logger.log(
      `Seeding completed! Total records imported: ${totalRecords}`,
    );
  }
}
