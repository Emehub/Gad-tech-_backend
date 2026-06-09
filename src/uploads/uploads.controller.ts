import {
  Controller, Post, Delete, Patch, Param, UseInterceptors,
  UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { memoryStorage } from 'multer';

const imageValidator = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
    new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
  ],
});

@ApiTags('Uploads')
@ApiBearerAuth('JWT')
@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post('products/:productId/images')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: '[Admin] Upload product image' })
  uploadProductImage(
    @Param('productId') productId: string,
    @UploadedFile(imageValidator) file: Express.Multer.File,
    @Query('isPrimary') isPrimary: string,
  ) {
    return this.uploadsService.uploadProductImage(productId, file, isPrimary === 'true');
  }

  @Delete('products/images/:imageId')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Delete product image' })
  deleteProductImage(@Param('imageId') imageId: string) {
    return this.uploadsService.deleteProductImage(imageId);
  }

  @Patch('products/images/:imageId/primary')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Set product image as primary' })
  setPrimaryImage(@Param('imageId') imageId: string) {
    return this.uploadsService.setPrimaryImage(imageId);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { avatar: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload user avatar' })
  uploadAvatar(@CurrentUser('id') userId: string, @UploadedFile(imageValidator) file: Express.Multer.File) {
    return this.uploadsService.uploadAvatar(userId, file);
  }

  @Post('banners')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: '[Admin] Upload banner image' })
  uploadBanner(@UploadedFile(imageValidator) file: Express.Multer.File) {
    return this.uploadsService.uploadBannerImage(file);
  }

  @Post('categories')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: '[Admin] Upload category image' })
  uploadCategory(@UploadedFile(imageValidator) file: Express.Multer.File) {
    return this.uploadsService.uploadCategoryImage(file);
  }
}
