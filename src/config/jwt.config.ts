import { ConfigService } from "@nestjs/config";
import { JwtModuleOptions } from "@nestjs/jwt";
import { Environment } from "src/common/environments.enum";

const testingConfig = {
    // jwt secret for testing - valid signature
    secret: '8Zz5tw0Ionm3XPZZfN0NOml3z9FMfmpgXwovR9fp6ryDIoGRM8EPHAB6iHsc0fb',
    signOptions: {
        expiresIn: '1d',
    },
};

export class JWTConfigFactory {

    private env: Environment;

    constructor(private configService: ConfigService) {
        this.env = this.configService.get<Environment>('NODE_ENV');
     }

    /**
     * Creates a JWT configuration object based on the provided environment.
     * 
     * @param {Environment} [env] - Optional environment parameter. If not provided, the default environment is used.
     * @returns {object} The JWT configuration object. If the environment is `Testing`, returns the `testingConfig`.
     * Otherwise, returns an object containing the JWT secret and sign options.
     */
    create(env?: Environment): JwtModuleOptions {
        const _env = env || this.env;

        if (_env === Environment.Testing) {
            return testingConfig;
        }

        return {
            secret: this.configService.get('JWT_SECRET'),
            signOptions: {
                expiresIn: '1d',
            },
        };
    }
}

