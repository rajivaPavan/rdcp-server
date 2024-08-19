import { Module } from '@nestjs/common';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { FormRepository } from './form.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Form, FormSchema } from './form.schema';
import { jwtModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Form.name, schema: FormSchema },
    ]),
    jwtModule
  ],
  controllers: [FormsController],
  providers: [FormsService, FormRepository]
})
export class FormsModule { }
