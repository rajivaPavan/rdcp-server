import { Module } from '@nestjs/common';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { FormsRepository } from './forms.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Form, FormSchema } from './entities/form.schema';
import { ConfigModule } from '@nestjs/config';
import { FormsEditingService } from './form-editing.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Form.name, schema: FormSchema }]),
  ],
  controllers: [FormsController],
  providers: [FormsService,
    FormsEditingService,
    FormsRepository],
  exports: [FormsService],
})
export class FormsModule { }
