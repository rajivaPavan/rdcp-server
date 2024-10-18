import { MailerService } from "@nestjs-modules/mailer";
import { INestApplication, VERSION_NEUTRAL, VersioningType } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { TestingModule, Test } from "@nestjs/testing";
import { MongoMemoryServer } from "mongodb-memory-server";
import { CoreModule } from "src/core.module";
import { MockRedisModule } from "src/redis/redis.module";
import { SeedService } from "src/users/seed";

export async function initializeE2ETest(mongod: MongoMemoryServer, app: INestApplication<any>) {
    mongod = await MongoMemoryServer.create({
        instance: {
            dbName: 'rdcp_test_db',
        },
        binary: {
            version: '6.0.0',
        }
    });
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({
                isGlobal: true,
            }),
            MockRedisModule,
            MongooseModule.forRoot(uri),
            CoreModule,
        ],
        providers: [
            {
                provide: MailerService,
                useValue: {
                    sendMail: jest.fn()
                }
            }
        ]
    }).compile();
    const seed = moduleFixture.get(SeedService);
    await seed.initTestAdmin();
    app = moduleFixture.createNestApplication({});

    app.enableVersioning({
        defaultVersion: [VERSION_NEUTRAL],
        type: VersioningType.URI
    });

    await app.init();
    return { mongod, app };
}
