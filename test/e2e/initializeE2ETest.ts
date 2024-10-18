import { MailerService } from "@nestjs-modules/mailer";
import { INestApplication, ValidationPipe, VERSION_NEUTRAL, VersioningType } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { TestingModule, Test } from "@nestjs/testing";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Environment } from "src/common/environments.enum";
import { JWTConfigFactory } from "src/config/jwt.config";
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
            JwtModule.registerAsync({
                inject: [ConfigService],
                global: true,
                useFactory: async (config: ConfigService) => {
                    const factory = new JWTConfigFactory(config);
                    const jwtConfig = factory.create(Environment.Testing);
                    config.set('JWT_SECRET', jwtConfig.secret);
                    return jwtConfig;
                },
            }),
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
    await seed.initTestUsers();

    app = moduleFixture.createNestApplication({});
    
    app.useGlobalPipes(new ValidationPipe());
    app.enableVersioning({
        defaultVersion: [VERSION_NEUTRAL],
        type: VersioningType.URI
    });

    await app.init();
    return { mongod, app };
}
