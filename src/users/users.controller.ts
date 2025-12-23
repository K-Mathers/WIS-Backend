import { Body, Controller, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUser } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUser) {
    return this.usersService.update(id, dto);
  }
}
