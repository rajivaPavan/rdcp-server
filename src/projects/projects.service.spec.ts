import { Types } from "mongoose";
import { CollaboratorsRepository } from "./collaborators.repository";
import { CreateProjectDto } from "./dtos/create-project.dto";
import { ProjectRoleEnum } from "./entities/project-role.enum";
import { ProjectRepository } from "./projects.repository";
import { ProjectNotFoundException, ProjectsService, UnauthorizedProjectAccessException } from "./projects.service";

describe('ProjectsService', () => {
  let projectsService: ProjectsService;
  let projectRepository: ProjectRepository;
  let collaboratorRepository: CollaboratorsRepository;

  beforeEach(() => {
    projectRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    } as any;

    collaboratorRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      find: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    } as any;

    projectsService = new ProjectsService(projectRepository, collaboratorRepository);
  });

  describe('getProject', () => {
    it('should return project details with roles', async () => {
      const projectId = new Types.ObjectId().toHexString();
      const userId = new Types.ObjectId().toHexString();
      const project = { _id: projectId, name: 'Test Project', description: 'Test Description' };
      const collaborator = { roles: [ProjectRoleEnum.OWNER] };

      (projectRepository.findById as jest.Mock).mockResolvedValue(project);
      (collaboratorRepository.findOne as jest.Mock).mockResolvedValue(collaborator);

      const result = await projectsService.getProject(projectId, userId);

      expect(result).toEqual({
        id: projectId,
        name: 'Test Project',
        description: 'Test Description',
        roles: [ProjectRoleEnum.OWNER],
      });
    });

    it('should throw ProjectNotFoundException if project not found', async () => {
      const projectId = new Types.ObjectId().toHexString();
      const userId = new Types.ObjectId().toHexString();

      (projectRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(projectsService.getProject(projectId, userId)).rejects.toThrow(ProjectNotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new project and return project details', async () => {
      const projectDTO = { name: 'New Project', description: 'New Description' } as CreateProjectDto;
      const userId = new Types.ObjectId().toHexString();
      const project = { _id: new Types.ObjectId(), ...projectDTO };
      const createdProject = { ...project, _id: new Types.ObjectId() };

      (projectRepository.create as jest.Mock).mockResolvedValue(createdProject);
      (collaboratorRepository.create as jest.Mock).mockResolvedValue({});

      const result = await projectsService.create(projectDTO, userId);

      expect(result).toEqual({
        ...createdProject,
        id: createdProject._id.toString(),
        roles: [ProjectRoleEnum.OWNER],
      });
    });
  });

  describe('deleteProject', () => {
    it('should delete a project if user is authorized', async () => {
      const projectId = new Types.ObjectId().toHexString();
      const userId = new Types.ObjectId().toHexString();
      const project = { _id: projectId };

      (projectRepository.findById as jest.Mock).mockResolvedValue(project);
      (collaboratorRepository.findOne as jest.Mock).mockResolvedValue({ roles: [ProjectRoleEnum.OWNER] });
      (projectRepository.delete as jest.Mock).mockResolvedValue({});

      await projectsService.deleteProject(projectId, userId);

      expect(projectRepository.delete).toHaveBeenCalledWith(projectId);
    });

    it('should throw UnauthorizedProjectAccessException if user is not authorized', async () => {
      const projectId = new Types.ObjectId().toHexString();
      const userId = new Types.ObjectId().toHexString();
      const project = { _id: projectId };

      (projectRepository.findById as jest.Mock).mockResolvedValue(project);
      (collaboratorRepository.findOne as jest.Mock).mockResolvedValue({ roles: [ProjectRoleEnum.EDITOR] });

      await expect(projectsService.deleteProject(projectId, userId)).rejects.toThrow(UnauthorizedProjectAccessException);
    });
  });
});