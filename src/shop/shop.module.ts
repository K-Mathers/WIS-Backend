import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { ShopAdminController } from './shop.admin.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [ShopController, ShopAdminController],
  providers: [ShopService],
})
export class ShopModule { }
