import {resolvePackagePath} from '@backstage/backend-common';
import {Knex} from 'knex';
import {CompoundEntityRef, parseEntityRef, stringifyEntityRef,} from '@backstage/catalog-model';
import {HealthCheckItem} from '@internal/plugin-health-check-common';
import {DateTime} from 'luxon';

/**
 * the database entity model
 * @internal
 */
interface DbHealthCheckRow {
  id: number;
  entityRef: string;
  url: string;
  isHealthy: any;
  errorMessage?: string | null;
  timestamp: Date;
}

export class DatabaseHandler {
  /**
   * Directory of the database migration files, relative to the package
   */
  private static readonly migrationsDir = resolvePackagePath(
    '@internal/plugin-health-check-backend',
    'migrations',
  );

  /**
   * Create the databaseHandler to access the database
   *
   * @param database a Knex instance
   */
  static async create(database: Knex): Promise<DatabaseHandler> {
    await database.migrate.latest({
      directory: this.migrationsDir,
    });

    return new DatabaseHandler(database);
  }

  private constructor(private readonly database: Knex) {}

  private readonly tableName = 'health-checks';
  private readonly healthCheckColumns = [
    'id',
    'entityRef',
    'url',
    'isHealthy',
    'errorMessage',
    'timestamp',
  ];

  /**
   * Select the healthCheck items for a given entity.
   *
   * @param entityRef of the entity
   * @param limit the number of elements
   * @param offset to select elements further in the past, defaults to 0
   */
  async getHealthCheckList(
    entityRef: CompoundEntityRef,
    limit: number,
    offset: number = 0,
  ): Promise<HealthCheckItem[]> {
    const queryResult = await this.database<DbHealthCheckRow>(this.tableName)
      .select(...this.healthCheckColumns)
      .where('entityRef', stringifyEntityRef(entityRef))
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .offset(offset);

    return queryResult.map(this.convertToHealthCheckItem);
  }

  /**
   * Insert a single healthCheck item into the database
   *
   * @param item a healthCheck item
   */
  async addSingleHealthCheck(item: HealthCheckItem) {
    const data = this.convertToInsertRow(item);
    await this.database<DbHealthCheckRow>(this.tableName).insert(data);
  }

  /**
   * Insert multiple healthCheck items into the database
   *
   * @param items list of healthCheck items
   */
  async addMultipleHealthChecks(items: HealthCheckItem[]) {
    if (items.length === 0) return;
    const data = items.map(this.convertToInsertRow);
    await this.database<DbHealthCheckRow>(this.tableName).insert(data);
  }

  /**
   * Convert the healthCheck item into a database entity, which can be inserted into the database.
   * The `id` is explicitly omitted, because it will be generated automatically upon insertion.
   *
   * @param item a healthCheck item
   * @return the database entity with the `id` omitted
   * @private
   */
  private convertToInsertRow(
    item: HealthCheckItem,
  ): Omit<DbHealthCheckRow, 'id'> {
    return {
      // the `id` will be generated automatically
      entityRef: stringifyEntityRef(item.entityRef),
      url: item.url,
      isHealthy: item.isHealthy,
      errorMessage: item.errorMessage,
      timestamp: item.timestamp.toJSDate(),
    };
  }

  /**
   * Convert the raw database entity into a usable object
   *
   * @param entity a raw database entity
   */
  private convertToHealthCheckItem(entity: DbHealthCheckRow): HealthCheckItem {
    return {
      id: Number(entity.id),
      entityRef: parseEntityRef(String(entity.entityRef)),
      url: String(entity.url),
      isHealthy: Boolean(entity.isHealthy),
      errorMessage:
        entity.errorMessage === null ? undefined : String(entity.errorMessage),
      timestamp: DateTime.fromJSDate(new Date(entity.timestamp)),
    };
  }
}
