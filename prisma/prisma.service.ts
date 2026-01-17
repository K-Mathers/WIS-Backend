import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        const connectionString = `${process.env.DIRECT_URL}`;
        const pool = new Pool({
            connectionString,
            ssl: { rejectUnauthorized: false }
        });

        const adapter = new PrismaPg(pool);
        super({ adapter });
    }
}