import { HttpStatus } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

/**
 * Prisma Error Codes
 * Official Reference: https://www.prisma.io/docs/reference/api-reference/error-reference
 */
export const PrismaErrorCodes = {
    // Authentication and Connection errors (P1xxx)
    P1000: 'P1000',
    P1001: 'P1001',
    P1002: 'P1002',
    P1003: 'P1003',
    P1008: 'P1008',
    P1009: 'P1009',
    P1010: 'P1010',
    P1011: 'P1011',
    P1012: 'P1012',
    P1013: 'P1013',
    P1014: 'P1014',
    P1015: 'P1015',
    P1016: 'P1016',
    P1017: 'P1017',

    // Query Engine errors (P2xxx)
    P2000: 'P2000',
    P2001: 'P2001',
    P2002: 'P2002',
    P2003: 'P2003',
    P2004: 'P2004',
    P2005: 'P2005',
    P2006: 'P2006',
    P2007: 'P2007',
    P2008: 'P2008',
    P2009: 'P2009',
    P2010: 'P2010',
    P2011: 'P2011',
    P2012: 'P2012',
    P2013: 'P2013',
    P2014: 'P2014',
    P2015: 'P2015',
    P2016: 'P2016',
    P2017: 'P2017',
    P2018: 'P2018',
    P2019: 'P2019',
    P2020: 'P2020',
    P2021: 'P2021',
    P2022: 'P2022',
    P2023: 'P2023',
    P2024: 'P2024',
    P2025: 'P2025',
    P2026: 'P2026',
    P2027: 'P2027',
    P2028: 'P2028',
    P2029: 'P2029',
    P2030: 'P2030',
    P2031: 'P2031',
    P2032: 'P2032',
    P2033: 'P2033',
    P2034: 'P2034',
    P2035: 'P2035',
    P2036: 'P2036',
    P2037: 'P2037',

    // Migration Engine errors (P3xxx)
    P3000: 'P3000',
    P3001: 'P3001',
    P3002: 'P3002',
    P3003: 'P3003',
    P3004: 'P3004',
    P3005: 'P3005',
    P3006: 'P3006',
    P3007: 'P3007',
    P3008: 'P3008',
    P3009: 'P3009',
    P3010: 'P3010',
    P3011: 'P3011',
    P3012: 'P3012',
    P3013: 'P3013',
    P3014: 'P3014',
    P3015: 'P3015',
    P3016: 'P3016',
    P3017: 'P3017',
    P3018: 'P3018',
    P3019: 'P3019',
    P3020: 'P3020',
    P3021: 'P3021',
    P3022: 'P3022',

    // Introspection Engine errors (P4xxx)
    P4000: 'P4000',
    P4001: 'P4001',
    P4002: 'P4002',

    // Prisma Accelerate errors (P6xxx)
    P6000: 'P6000',
    P6001: 'P6001',
    P6002: 'P6002',
    P6004: 'P6004',
    P6005: 'P6005',
    P6006: 'P6006',
    P6008: 'P6008',
    P6009: 'P6009',
    P6010: 'P6010',
} as const;

export type PrismaErrorCode = typeof PrismaErrorCodes[keyof typeof PrismaErrorCodes];

/**
 * Utility class to extract and format Prisma error metadata
 */
class PrismaErrorMapper {
    /**
   * Extract target field from Prisma error meta with enhanced logic
   */
    static extractTarget(target: any): string {
        if (!target) return 'unknown_field';

        if (Array.isArray(target)) {
            return target.length === 1 ? target[0] : target.join('_');
        }

        if (typeof target === 'string') {
            return target;
        }

        return 'unknown_field';
    }

    /**
     * Extract field name from error message with comprehensive patterns
     */
    static extractFieldFromMessage(message: string): string | null {
        if (!message) return null;

        // Enhanced field extraction patterns
        const fieldPatterns = [
            /field[s]?\s*[`'":]?\s*([a-zA-Z_][a-zA-Z0-9_]*)/i,
            /column[s]?\s*[`'":]?\s*([a-zA-Z_][a-zA-Z0-9_]*)/i,
            /constraint[s]?\s*[`'":]?\s*([a-zA-Z_][a-zA-Z0-9_]*)/i,
            /Foreign key constraint failed on the field[s]?\s*[`'":]?\s*([a-zA-Z_][a-zA-Z0-9_]*)/i,
            /Null constraint violation on the field[s]?\s*[`'":]?\s*\(?([a-zA-Z_][a-zA-Z0-9_]*)\)?/i,
            /Argument\s+[`'"]?([a-zA-Z_][a-zA-Z0-9_]*)[`'"]?/i,
            /on\s+[`'"]?([a-zA-Z_][a-zA-Z0-9_]*)[`'"]?/i,
        ];

        for (const pattern of fieldPatterns) {
            const match = message.match(pattern);
            if (match?.[1]) {
                return match[1];
            }
        }

        return null;
    }

    /**
     * Extract database name from error message
     */
    static extractDatabaseName(message: string): string {
        if (!message) return 'database';

        const dbPatterns = [
            /database\s+[`'"]?([^`'">\s]+)[`'"]?/i,
            /Database\s+[`'"]?([^`'">\s]+)[`'"]?/i,
            /db\s+[`'"]?([^`'">\s]+)[`'"]?/i,
        ];

        for (const pattern of dbPatterns) {
            const match = message.match(pattern);
            if (match?.[1]) {
                return match[1];
            }
        }

        return 'database';
    }

    /**
     * Extract table name from error message
     */
    static extractTableName(message: string): string {
        if (!message) return 'table';

        const tablePatterns = [
            /table\s+[`'"]?([a-zA-Z_][a-zA-Z0-9_]*)[`'"]?/i,
            /relation\s+[`'"]?([a-zA-Z_][a-zA-Z0-9_]*)[`'"]?/i,
            /model\s+[`'"]?([a-zA-Z_][a-zA-Z0-9_]*)[`'"]?/i,
            /on\s+[`'"]?([a-zA-Z_][a-zA-Z0-9_]*)[`'"]?/i,
        ];

        for (const pattern of tablePatterns) {
            const match = message.match(pattern);
            if (match?.[1]) {
                return match[1];
            }
        }

        return 'table';
    }
}

type PrismaErrorHandler = {
    status: number;
    message: string;
    buildErrors?: (exception: PrismaClientKnownRequestError) => Record<string, string[]>;
};

/**
 * Mapping of Prisma error codes to corresponding handlers
 */
export const prismaErrorMap: Record<PrismaErrorCode, PrismaErrorHandler> = {
    // ========================================
    // CONNECTION ERRORS (P1xxx)
    // ========================================
    [PrismaErrorCodes.P1000]: {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database authentication failed',
        buildErrors: () => ({ auth: ['Invalid database credentials'] }),
    },
    [PrismaErrorCodes.P1001]: {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database server unreachable',
        buildErrors: () => ({ connection: ['Unable to reach database server'] }),
    },
    [PrismaErrorCodes.P1002]: {
        status: HttpStatus.REQUEST_TIMEOUT,
        message: 'Database connection timeout',
        buildErrors: () => ({ connection: ['Database server reached but timed out'] }),
    },
    [PrismaErrorCodes.P1003]: {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database not found',
        buildErrors: (e) => ({
            database: [`Database "${PrismaErrorMapper.extractDatabaseName(e.message)}" does not exist`],
        }),
    },
    [PrismaErrorCodes.P1008]: {
        status: HttpStatus.REQUEST_TIMEOUT,
        message: 'Database operation timeout',
        buildErrors: () => ({ timeout: ['Database operation timed out'] }),
    },
    [PrismaErrorCodes.P1009]: {
        status: HttpStatus.CONFLICT,
        message: 'Database already exists',
        buildErrors: () => ({ database: ['Database with this name already exists'] }),
    },
    [PrismaErrorCodes.P1010]: {
        status: HttpStatus.FORBIDDEN,
        message: 'Database access denied',
        buildErrors: () => ({ access: ['User does not have access to the database'] }),
    },
    [PrismaErrorCodes.P1011]: {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'TLS connection error',
        buildErrors: () => ({ connection: ['Error establishing secure connection to database'] }),
    },
    [PrismaErrorCodes.P1012]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database schema error',
        buildErrors: () => ({ schema: ['Database schema validation failed'] }),
    },
    [PrismaErrorCodes.P1013]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid database connection string',
        buildErrors: () => ({ connection: ['Database connection string is invalid'] }),
    },
    [PrismaErrorCodes.P1014]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Datasource kind does not exist',
        buildErrors: () => ({ datasource: ['The underlying datasource kind does not exist'] }),
    },
    [PrismaErrorCodes.P1015]: {
        status: HttpStatus.NOT_IMPLEMENTED,
        message: 'Unsupported database features',
        buildErrors: () => ({ schema: ['Prisma schema uses features not supported by database version'] }),
    },
    [PrismaErrorCodes.P1016]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Raw query parameter mismatch',
        buildErrors: () => ({ query: ['Raw query has incorrect number of parameters'] }),
    },
    [PrismaErrorCodes.P1017]: {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database connection closed',
        buildErrors: () => ({ connection: ['Database server closed the connection'] }),
    },

    // ========================================
    // QUERY ENGINE ERRORS (P2xxx)
    // ========================================
    [PrismaErrorCodes.P2000]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Value too long for column',
        buildErrors: (e) => {
            const field = PrismaErrorMapper.extractFieldFromMessage(e.message) || 'field';
            return { [field]: [`Value for ${field} exceeds maximum length`] };
        },
    },
    [PrismaErrorCodes.P2001]: {
        status: HttpStatus.NOT_FOUND,
        message: 'Record not found',
        buildErrors: () => ({ search: ['No record found matching the search criteria'] }),
    },
    [PrismaErrorCodes.P2002]: {
        status: HttpStatus.CONFLICT,
        message: 'Unique constraint violation',
        buildErrors: (e) => {
            const target = PrismaErrorMapper.extractTarget(e.meta?.target);
            return { [target]: [`A record with this ${target} already exists`] };
        },
    },
    [PrismaErrorCodes.P2003]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Foreign key constraint violation',
        buildErrors: (e) => {
            const field = PrismaErrorMapper.extractFieldFromMessage(e.message) || 'foreign_key';
            return { [field]: [`Referenced ${field} does not exist`] };
        },
    },
    [PrismaErrorCodes.P2004]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Database constraint failed',
        buildErrors: () => ({ constraint: ['A database constraint was violated'] }),
    },
    [PrismaErrorCodes.P2005]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Invalid field value in database',
        buildErrors: () => ({ data: ['Database contains invalid value for field type'] }),
    },
    [PrismaErrorCodes.P2006]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid field value',
        buildErrors: () => ({ validation: ['Provided value is not valid for this field'] }),
    },
    [PrismaErrorCodes.P2007]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Data validation error',
        buildErrors: () => ({ validation: ['Data validation failed'] }),
    },
    [PrismaErrorCodes.P2008]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Query parsing failed',
        buildErrors: () => ({ query: ['Failed to parse the database query'] }),
    },
    [PrismaErrorCodes.P2009]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Query validation failed',
        buildErrors: () => ({ query: ['Query validation failed'] }),
    },
    [PrismaErrorCodes.P2010]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Raw query execution failed',
        buildErrors: () => ({ query: ['Raw query could not be executed'] }),
    },
    [PrismaErrorCodes.P2011]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Null constraint violation',
        buildErrors: (e) => {
            const field = PrismaErrorMapper.extractFieldFromMessage(e.message) || 'field';
            return { [field]: [`Field ${field} cannot be null`] };
        },
    },
    [PrismaErrorCodes.P2012]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Missing required value',
        buildErrors: (e) => {
            const field = PrismaErrorMapper.extractFieldFromMessage(e.message) || 'field';
            return { [field]: [`Field ${field} is required`] };
        },
    },
    [PrismaErrorCodes.P2013]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Missing required argument',
        buildErrors: () => ({ argument: ['A required argument is missing'] }),
    },
    [PrismaErrorCodes.P2014]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Required relation violation',
        buildErrors: () => ({ relation: ['Cannot modify record due to required relation'] }),
    },
    [PrismaErrorCodes.P2015]: {
        status: HttpStatus.NOT_FOUND,
        message: 'Related record not found',
        buildErrors: () => ({ relation: ['A related record could not be found'] }),
    },
    [PrismaErrorCodes.P2016]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Query interpretation error',
        buildErrors: () => ({ query: ['Error interpreting query'] }),
    },
    [PrismaErrorCodes.P2017]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Records not connected',
        buildErrors: () => ({ relation: ['The records for this relation are not connected'] }),
    },
    [PrismaErrorCodes.P2018]: {
        status: HttpStatus.NOT_FOUND,
        message: 'Required connected records not found',
        buildErrors: () => ({ relation: ['Required connected records were not found'] }),
    },
    [PrismaErrorCodes.P2019]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Input error',
        buildErrors: () => ({ input: ['Input data is invalid'] }),
    },
    [PrismaErrorCodes.P2020]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Value out of range',
        buildErrors: () => ({ range: ['Value is out of range for the field type'] }),
    },
    [PrismaErrorCodes.P2021]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Table does not exist',
        buildErrors: (e) => {
            const tableName = PrismaErrorMapper.extractTableName(e.message);
            return { schema: [`Table ${tableName} does not exist in database`] };
        },
    },
    [PrismaErrorCodes.P2022]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Column does not exist',
        buildErrors: (e) => {
            const columnField = PrismaErrorMapper.extractFieldFromMessage(e.message) || 'column';
            return { schema: [`Column ${columnField} does not exist in database`] };
        },
    },
    [PrismaErrorCodes.P2023]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Inconsistent column data',
        buildErrors: () => ({ data: ['Column data is inconsistent'] }),
    },
    [PrismaErrorCodes.P2024]: {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Connection pool timeout',
        buildErrors: () => ({ pool: ['Timed out getting connection from pool'] }),
    },
    [PrismaErrorCodes.P2025]: {
        status: HttpStatus.NOT_FOUND,
        message: 'Record not found for operation',
        buildErrors: () => ({ record: ['Required record could not be found for this operation'] }),
    },
    [PrismaErrorCodes.P2026]: {
        status: HttpStatus.NOT_IMPLEMENTED,
        message: 'Unsupported database feature',
        buildErrors: () => ({ feature: ['Database provider does not support this feature'] }),
    },
    [PrismaErrorCodes.P2027]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Multiple database errors',
        buildErrors: () => ({ multiple: ['Multiple errors occurred during query execution'] }),
    },
    [PrismaErrorCodes.P2028]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Transaction API error',
        buildErrors: () => ({ transaction: ['Error in transaction API usage'] }),
    },
    [PrismaErrorCodes.P2029]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Query parameter limit exceeded',
        buildErrors: () => ({ parameters: ['Too many parameters in query'] }),
    },
    [PrismaErrorCodes.P2030]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Fulltext index not found',
        buildErrors: () => ({ search: ['No fulltext index available for search'] }),
    },
    [PrismaErrorCodes.P2031]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'MongoDB replica set required',
        buildErrors: () => ({ mongo: ['MongoDB must be run as replica set for transactions'] }),
    },
    [PrismaErrorCodes.P2032]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Number too large',
        buildErrors: () => ({ number: ['Number exceeds 64-bit signed integer limit'] }),
    },
    [PrismaErrorCodes.P2033]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Number requires BigInt',
        buildErrors: () => ({ number: ['Number too large, consider using BigInt type'] }),
    },
    [PrismaErrorCodes.P2034]: {
        status: HttpStatus.CONFLICT,
        message: 'Transaction conflict',
        buildErrors: () => ({ transaction: ['Transaction failed due to write conflict or deadlock'] }),
    },
    [PrismaErrorCodes.P2035]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database assertion violation',
        buildErrors: () => ({ assertion: ['Database assertion was violated'] }),
    },
    [PrismaErrorCodes.P2036]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'External connector error',
        buildErrors: () => ({ connector: ['Error occurred in external connector'] }),
    },
    [PrismaErrorCodes.P2037]: {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Too many database connections',
        buildErrors: () => ({ connections: ['Maximum database connections exceeded'] }),
    },

    // ========================================
    // MIGRATION ENGINE ERRORS (P3xxx)
    // ========================================
    [PrismaErrorCodes.P3000]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to create database',
        buildErrors: () => ({ migration: ['Database creation failed during migration'] }),
    },
    [PrismaErrorCodes.P3001]: {
        status: HttpStatus.CONFLICT,
        message: 'Destructive migration detected',
        buildErrors: () => ({ migration: ['Migration requires destructive changes'] }),
    },
    [PrismaErrorCodes.P3002]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Migration rolled back',
        buildErrors: () => ({ migration: ['Migration was rolled back due to error'] }),
    },
    [PrismaErrorCodes.P3003]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Migration format changed',
        buildErrors: () => ({ migration: ['Migration format has changed, manual intervention required'] }),
    },
    [PrismaErrorCodes.P3004]: {
        status: HttpStatus.PRECONDITION_FAILED,
        message: 'Database is empty',
        buildErrors: () => ({ database: ['Database is empty and requires initialization'] }),
    },
    [PrismaErrorCodes.P3005]: {
        status: HttpStatus.CONFLICT,
        message: 'Database schema not empty',
        buildErrors: () => ({ schema: ['Cannot reset non-empty database schema'] }),
    },
    [PrismaErrorCodes.P3006]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Migration failed to apply',
        buildErrors: () => ({ migration: ['Migration could not be applied to database'] }),
    },
    [PrismaErrorCodes.P3007]: {
        status: HttpStatus.NOT_IMPLEMENTED,
        message: 'Preview features not allowed in migration',
        buildErrors: () => ({ features: ['Some preview features are not allowed in migration engine'] }),
    },
    [PrismaErrorCodes.P3008]: {
        status: HttpStatus.CONFLICT,
        message: 'Migration already applied',
        buildErrors: () => ({ migration: ['This migration has already been applied'] }),
    },
    [PrismaErrorCodes.P3009]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed migrations found',
        buildErrors: () => ({ migration: ['Found failed migrations in target database'] }),
    },
    [PrismaErrorCodes.P3010]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Migration name too long',
        buildErrors: () => ({ migration: ['Migration name exceeds maximum length'] }),
    },
    [PrismaErrorCodes.P3011]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Migration cannot be rolled back',
        buildErrors: () => ({ migration: ['This migration cannot be rolled back'] }),
    },
    [PrismaErrorCodes.P3012]: {
        status: HttpStatus.NOT_FOUND,
        message: 'Migration file not found',
        buildErrors: () => ({ migration: ['Migration file could not be found'] }),
    },
    [PrismaErrorCodes.P3013]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Datasource provider arrays not supported',
        buildErrors: () => ({ datasource: ['Datasource provider arrays are deprecated'] }),
    },
    [PrismaErrorCodes.P3014]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Could not create shadow database',
        buildErrors: () => ({ shadow: ['Shadow database creation failed'] }),
    },
    [PrismaErrorCodes.P3015]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Could not find shadow database',
        buildErrors: () => ({ shadow: ['Shadow database could not be found'] }),
    },
    [PrismaErrorCodes.P3016]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Could not use shadow database fallback',
        buildErrors: () => ({ shadow: ['Could not fall back to using shadow database'] }),
    },
    [PrismaErrorCodes.P3017]: {
        status: HttpStatus.NOT_FOUND,
        message: 'Migration could not be found',
        buildErrors: () => ({ migration: ['The migration could not be found'] }),
    },
    [PrismaErrorCodes.P3018]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Migration application failed',
        buildErrors: () => ({ migration: ['Migration failed to apply to database'] }),
    },
    [PrismaErrorCodes.P3019]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Datasource provider arrays deprecated',
        buildErrors: () => ({ datasource: ['Datasource provider arrays are deprecated'] }),
    },
    [PrismaErrorCodes.P3020]: {
        status: HttpStatus.NOT_IMPLEMENTED,
        message: 'Shadow database creation disabled on Azure SQL',
        buildErrors: () => ({ shadow: ['Automatic shadow database creation is disabled on Azure SQL'] }),
    },
    [PrismaErrorCodes.P3021]: {
        status: HttpStatus.NOT_IMPLEMENTED,
        message: 'Foreign keys not supported on this database',
        buildErrors: () => ({ foreignKey: ['Foreign keys cannot be created on this database'] }),
    },
    [PrismaErrorCodes.P3022]: {
        status: HttpStatus.FORBIDDEN,
        message: 'DDL execution disabled',
        buildErrors: () => ({ ddl: ['Direct DDL execution is disabled for this database'] }),
    },

    // ========================================
    // INTROSPECTION ENGINE ERRORS (P4xxx)
    // ========================================
    [PrismaErrorCodes.P4000]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Introspection failed',
        buildErrors: () => ({ introspection: ['Failed to generate schema from database'] }),
    },
    [PrismaErrorCodes.P4001]: {
        status: HttpStatus.PRECONDITION_FAILED,
        message: 'Database is empty for introspection',
        buildErrors: () => ({ introspection: ['Cannot introspect an empty database'] }),
    },
    [PrismaErrorCodes.P4002]: {
        status: HttpStatus.CONFLICT,
        message: 'Database schema inconsistent',
        buildErrors: () => ({ introspection: ['Database schema is inconsistent'] }),
    },

    // ========================================
    // PRISMA ACCELERATE ERRORS (P6xxx)
    // ========================================
    [PrismaErrorCodes.P6000]: {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Could not connect to Prisma Accelerate',
        buildErrors: () => ({ accelerate: ['Unable to connect to Prisma Accelerate service'] }),
    },
    [PrismaErrorCodes.P6001]: {
        status: HttpStatus.REQUEST_TIMEOUT,
        message: 'Prisma Accelerate timeout',
        buildErrors: () => ({ accelerate: ['HTTP request timeout to Prisma Accelerate'] }),
    },
    [PrismaErrorCodes.P6002]: {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Accelerate connection pool timeout',
        buildErrors: () => ({ accelerate: ['Connection pool timeout in Prisma Accelerate'] }),
    },
    [PrismaErrorCodes.P6004]: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Accelerate response time measurement error',
        buildErrors: () => ({ accelerate: ['Error measuring response time in Prisma Accelerate'] }),
    },
    [PrismaErrorCodes.P6005]: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid Accelerate connection string',
        buildErrors: () => ({ accelerate: ['Prisma Accelerate connection string is invalid'] }),
    },
    [PrismaErrorCodes.P6006]: {
        status: HttpStatus.NOT_FOUND,
        message: 'Accelerate edge region not found',
        buildErrors: () => ({ accelerate: ['Prisma Accelerate edge region not found'] }),
    },
    [PrismaErrorCodes.P6008]: {
        status: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized Accelerate connection',
        buildErrors: () => ({ accelerate: ['Check your Prisma Accelerate connection string'] }),
    },
    [PrismaErrorCodes.P6009]: {
        status: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Accelerate connection limit reached',
        buildErrors: () => ({ accelerate: ['Prisma Accelerate connection limit exceeded'] }),
    },
    [PrismaErrorCodes.P6010]: {
        status: HttpStatus.REQUEST_TIMEOUT,
        message: 'Query timeout in Accelerate',
        buildErrors: () => ({ accelerate: ['Query timeout in Prisma Accelerate'] }),
    },
};
