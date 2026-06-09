import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadsService {
  constructor(private configService: ConfigService, private prisma: PrismaService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadProductImage(productId: string, file: Express.Multer.File, isPrimary = false) {
    if (!file) throw new BadRequestException('No file uploaded');
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new BadRequestException('Product not found');

    const result = await this.uploadToCloudinary(file.buffer, `ecommerce/products/${productId}`);

    if (isPrimary) {
      await this.prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
    }

    const count = await this.prisma.productImage.count({ where: { productId } });
    const image = await this.prisma.productImage.create({
      data: {
        productId,
        url: result.secure_url,
        publicId: result.public_id,
        isPrimary: isPrimary || count === 0,
        sortOrder: count,
      },
    });

    return { message: 'Image uploaded', data: image };
  }

  async deleteProductImage(imageId: string) {
    const image = await this.prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) throw new BadRequestException('Image not found');

    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }
    await this.prisma.productImage.delete({ where: { id: imageId } });

    if (image.isPrimary) {
      const next = await this.prisma.productImage.findFirst({
        where: { productId: image.productId }, orderBy: { sortOrder: 'asc' },
      });
      if (next) await this.prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }

    return { message: 'Image deleted' };
  }

  async setPrimaryImage(imageId: string) {
    const image = await this.prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) throw new BadRequestException('Image not found');
    await this.prisma.productImage.updateMany({ where: { productId: image.productId }, data: { isPrimary: false } });
    await this.prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } });
    return { message: 'Primary image updated' };
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const result = await this.uploadToCloudinary(file.buffer, `ecommerce/avatars/${userId}`);
    await this.prisma.user.update({ where: { id: userId }, data: { avatar: result.secure_url } });
    return { message: 'Avatar updated', data: { avatar: result.secure_url } };
  }

  async uploadBannerImage(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const result = await this.uploadToCloudinary(file.buffer, 'ecommerce/banners');
    return { message: 'Banner image uploaded', data: { url: result.secure_url, publicId: result.public_id } };
  }

  async uploadCategoryImage(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const result = await this.uploadToCloudinary(file.buffer, 'ecommerce/categories');
    return { message: 'Category image uploaded', data: { url: result.secure_url } };
  }

  private uploadToCloudinary(buffer: Buffer, folder: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
        (error, result) => {
          if (error) reject(new BadRequestException(error.message));
          else resolve(result);
        },
      ).end(buffer);
    });
  }
}
