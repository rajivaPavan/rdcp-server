import { Test, TestingModule } from '@nestjs/testing';
import { ProjectAuthorization, projectActions, ProjectAction } from './forms.authorization';
import { CollaboratorsRepository } from 'src/projects/collaborators.repository';
import { ProjectRoleEnum } from 'src/projects/entities/project-role.enum';
import { Types } from 'mongoose';

describe('FormsAuthorization', () => {
    let service: ProjectAuthorization;
    let collaboratorsRepository: CollaboratorsRepository;
    const project = new Types.ObjectId();
    const user = new Types.ObjectId();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProjectAuthorization,
                {
                    provide: CollaboratorsRepository,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ProjectAuthorization>(ProjectAuthorization);
        collaboratorsRepository = module.get<CollaboratorsRepository>(CollaboratorsRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return false if collaborator is not found', async () => {
        jest.spyOn(collaboratorsRepository, 'findOne').mockResolvedValue(null);

        const result = await service.isAuthorized(user.toString(), project.toString(), 'create');
        expect(result).toBe(false);
    });

    it('should return true if user is an owner', async () => {
        jest.spyOn(collaboratorsRepository, 'findOne').mockResolvedValue({
            project, user,
            roles: [ProjectRoleEnum.OWNER],
        });

        const result = await service.isAuthorized(user.toString(), project.toString(), 'create');
        expect(result).toBe(true);
    });

    it('should return true if user has required role', async () => {
        jest.spyOn(collaboratorsRepository, 'findOne').mockResolvedValue({
            project, user,
            roles: [ProjectRoleEnum.MANAGER],
        });

        const result = await service.isAuthorized(user.toString(), project.toString(), 'create');
        expect(result).toBe(true);
    });

    it('should return false if user does not have required role', async () => {
        jest.spyOn(collaboratorsRepository, 'findOne').mockResolvedValue({
            project, user,
            roles: [ProjectRoleEnum.EDITOR],
        });

        const result = await service.isAuthorized(user.toString(), project.toString(),'create');
        expect(result).toBe(false);
    });

    it('should return true if user has one of the required roles', async () => {
        jest.spyOn(collaboratorsRepository, 'findOne').mockResolvedValue({
            project, user,
            roles: [ProjectRoleEnum.ANALYST],
        });

        const result = await service.isAuthorized(user.toString(), project.toString(), 'view_responses');
        expect(result).toBe(true);
    });
});