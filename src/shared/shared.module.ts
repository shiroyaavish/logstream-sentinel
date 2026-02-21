import { Global, Module } from '@nestjs/common';
import { API_KEY_REPOSITORY } from 'src/project/interface/apiKey.interface';
import { ApiKeyRepository } from 'src/project/repositories/apiKey.repository';
import { PROJECT_REPOSITORY, ProjectRepository } from 'src/project/repositories/project.repository';
import { SESSION_REPOSITORY } from 'src/user/interface/session.interface';
import { USER_REPOSITORY } from 'src/user/interface/user.interface';
import { SessionRepository } from 'src/user/repositories/session.repository';
import { UserRepository } from 'src/user/repositories/user.repository';

@Global()
@Module({
    providers: [
        {
            provide: PROJECT_REPOSITORY,
            useClass: ProjectRepository
        },
        {
            provide: USER_REPOSITORY,
            useClass: UserRepository,
        },
        {
            provide: SESSION_REPOSITORY,
            useClass: SessionRepository
        },
        {
            provide: API_KEY_REPOSITORY,
            useClass: ApiKeyRepository
        }
    ],
    exports: [PROJECT_REPOSITORY, USER_REPOSITORY, SESSION_REPOSITORY, API_KEY_REPOSITORY]
})
export class SharedModule { }
