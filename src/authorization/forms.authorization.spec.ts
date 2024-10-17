import { Test, TestingModule } from '@nestjs/testing';
import { FormAuthorization, UnPublishedFormException } from './forms.authorization';
import { FormsRepository } from 'src/forms/forms.repository';
import { ProjectAuthorization } from './projects.authorization';
import { NoFormAccessException } from 'src/responses/responses.controller';
import { Form } from 'src/forms/entities/form.schema';
import { ProjectRoleEnum } from 'src/projects/entities/project-role.enum';

describe('FormAuthorization', () => {
    let formAuthorization: FormAuthorization;
    let formsRepository: FormsRepository;
    let projectAuthorization: ProjectAuthorization;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FormAuthorization,
                {
                    provide: FormsRepository,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: ProjectAuthorization,
                    useValue: {
                        getProjectRoles: jest.fn(),
                    },
                },
            ],
        }).compile();

        formAuthorization = module.get<FormAuthorization>(FormAuthorization);
        formsRepository = module.get<FormsRepository>(FormsRepository);
        projectAuthorization = module.get<ProjectAuthorization>(ProjectAuthorization);
    });

    describe('privateSubmissionAuth', () => {
        it('should throw UnPublishedFormException if the form is not published', async () => {
            const form = { isPublished: false };
            const userId = 'testUserId';

            await expect(formAuthorization.privateSubmissionAuth(form, userId)).rejects.toThrow(UnPublishedFormException);
        });

        it('should authorize if the form is not private', async () => {
            const form = { isPublished: true, isPrivate: false };
            const userId = 'testUserId';

            const result = await formAuthorization.privateSubmissionAuth(form, userId);
            expect(result).toEqual({ authorized: true });
        });

        it('should throw NoFormAccessException if the user is neither a collaborator nor a participant', async () => {
            const form = { isPublished: true, isPrivate: true, projectId: 'testProjectId' };
            const userId = 'testUserId';
            jest.spyOn(projectAuthorization, 'getProjectRoles').mockResolvedValue([]);
            jest.spyOn(formAuthorization, 'isParticipant').mockResolvedValue(false);

            await expect(formAuthorization.privateSubmissionAuth(form, userId)).rejects.toThrow(NoFormAccessException);
        });

        it('should authorize if the user is a collaborator or a participant', async () => {
            const form = { isPublished: true, isPrivate: true, projectId: 'testProjectId' };
            const userId = 'testUserId';
            jest.spyOn(projectAuthorization, 'getProjectRoles').mockResolvedValue([
                ProjectRoleEnum.MANAGER,
            ]);
            jest.spyOn(formAuthorization, 'isParticipant').mockResolvedValue(true);

            const result = await formAuthorization.privateSubmissionAuth(form, userId);
            expect(result).toEqual({ authorized: true });
        });
    });

    describe('publicSubmissionAuth', () => {
        it('should throw UnPublishedFormException if the form is not published', () => {
            const form = { isPublished: false };

            expect(() => formAuthorization.publicSubmissionAuth(form)).toThrow(UnPublishedFormException);
        });

        it('should authorize if the form is not private', () => {
            const form = { isPublished: true, isPrivate: false };

            const result = formAuthorization.publicSubmissionAuth(form);
            expect(result).toEqual({ authorized: true });
        });

        it('should not authorize if the form is private', () => {
            const form = { isPublished: true, isPrivate: true };

            const result = formAuthorization.publicSubmissionAuth(form);
            expect(result).toEqual({ authorized: false });
        });
    });
});