import { IsNumber, IsString } from "class-validator";

export class CreateProjectDto {
    @IsString()
    name: string

    @IsString()
    description: string
}

export class FindAllProjectsDto {
    @IsNumber()
    offset: number

    @IsNumber()
    limit: number

    @IsString()
    search?: string

}

export class GenerateApiKeyDto {
    @IsNumber()
    project_id: number
}
