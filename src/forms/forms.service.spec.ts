import { Test, TestingModule } from '@nestjs/testing';
import { FormsService } from './forms.service';
import { FormsRepository } from './forms.repository';
import { CreateFormDTO, FormDTO, UpdateFormDTO } from './dtos/form.dto';
import { Form } from './entities/form.schema';
import { Types } from 'mongoose';

describe('FormsService', () => {
    let service: FormsService;
    let repository: FormsRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FormsService,
                {
                    provide: FormsRepository,
                    useValue: {
                        create: jest.fn(),
                        find: jest.fn(),
                        findById: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<FormsService>(FormsService);
        repository = module.get<FormsRepository>(FormsRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createForm', () => {
        it('should create a form', async () => {

            const formDto: CreateFormDTO = {
                name: 'Test Form',
                description: 'Test Description',
                projectId: '507f1f77bcf86cd799439011'
            };

            const userId = '507f1f77bcf86cd799439012';
            const createdForm = {
                ...formDto,
                isPrivate: true,
                isPublished: false,
                multipleResponses: false,
                _id: new Types.ObjectId(),
                projectId: new Types.ObjectId(formDto.projectId),
            };

            jest.spyOn(repository, 'create').mockResolvedValue(createdForm as any);

            const result = await service.createForm(formDto, userId);

            expect(result).toEqual({
                ...createdForm,
                id: createdForm._id.toString(),
                projectId: createdForm.projectId.toString(),
            });
        });
    });

    describe('getForms', () => {
        it('should return an array of forms', async () => {
            const projectId = '507f1f77bcf86cd799439011';
            const userId = '507f1f77bcf86cd799439012';
            const forms = [
                {
                    _id: new Types.ObjectId(),
                    name: 'Test Form',
                    description: 'Test Description',
                    projectId: new Types.ObjectId(projectId),
                },
            ];

            jest.spyOn(repository, 'find').mockResolvedValue(forms as any);

            const result = await service.getForms(projectId, userId);

            expect(result).toEqual(
                forms.map((form) => ({
                    ...form,
                    id: form._id.toString(),
                    projectId: form.projectId.toString(),
                })),
            );
        });
    });

    describe('getForm', () => {
        it('should return a form', async () => {
            const formId = '507f1f77bcf86cd799439011';
            const form = {
                _id: new Types.ObjectId(formId),
                name: 'Test Form',
                description: 'Test Description',
                projectId: new Types.ObjectId(),
            };

            jest.spyOn(repository, 'findById').mockResolvedValue(form as any);

            const result = await service.getForm(formId);

            expect(result).toEqual({
                ...form,
                id: form._id.toString(),
                projectId: form.projectId.toString(),
            });
        });
    });

    describe('updateForm', () => {
        it('should update a form', async () => {
            const formId = '507f1f77bcf86cd799439011';
            const formDto: UpdateFormDTO = {
                name: 'Updated Form',
                description: 'Updated Description',
                projectId: '507f1f77bcf86cd799439012',
            };
            const updatedForm = {
                ...formDto,
                _id: new Types.ObjectId(formId),
                projectId: new Types.ObjectId(formDto.projectId),
            };

            jest.spyOn(repository, 'update').mockResolvedValue(updatedForm as any);

            const result = await service.updateForm(formId, formDto as FormDTO);

            expect(result).toEqual({
                ...updatedForm,
                id: updatedForm._id.toString(),
                projectId: updatedForm.projectId.toString(),
            });
        });
    });

    describe('publishForm', () => {
        it('should publish a form', async () => {
            const formId = '507f1f77bcf86cd799439011';
            const form = {
                _id: new Types.ObjectId(formId),
                draft: [{ field: 'value' }],
            };

            jest.spyOn(repository, 'findById').mockResolvedValue(form as any);
            jest.spyOn(repository, 'update').mockResolvedValue({
                ...form, isPublished: true,
                schema: form.draft
            } as any);

            const result = await service.publishForm(formId);

            expect(result).toEqual({ ...form, isPublished: true, schema: form.draft });
        });

        it('should throw an error if form schema is missing', async () => {
            const formId = '507f1f77bcf86cd799439011';
            const form = {
                _id: new Types.ObjectId(formId),
                draft: [],
            };

            jest.spyOn(repository, 'findById').mockResolvedValue(form as any);

            await expect(service.publishForm(formId)).rejects.toThrow('Form schema is missing');
        });
    });

    describe('deleteForm', () => {
        it('should delete a form', async () => {
            const formId = '507f1f77bcf86cd799439011';

            jest.spyOn(repository, 'delete').mockResolvedValue({ deleted: true } as any);

            const result = await service.deleteForm(formId);

            expect(result).toEqual({ deleted: true });
        });
    });

    describe('saveFormSchema', () => {
        it('should save form schema', async () => {
            const formId = '507f1f77bcf86cd799439011';
            const schema = { field: 'value' };

            jest.spyOn(repository, 'update').mockResolvedValue({ draft: schema } as any);

            const result = await service.saveFormSchema(formId, schema);

            expect(result).toEqual({ draft: schema });
        });
    });
});