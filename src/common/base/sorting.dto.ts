import { IsEnum, IsOptional, IsString } from "class-validator";

export class SortingDto {
    @IsString()
    @IsOptional()
    sortBy?: string;

    @IsEnum(['desc', 'asc'])
    @IsOptional()
    order?: 'desc' | 'asc' = 'desc';
}