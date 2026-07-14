import { PartialType } from '@nestjs/swagger';
import { CreateShadeDto } from './create-shade.dto';

export class UpdateShadeDto extends PartialType(CreateShadeDto) {}
