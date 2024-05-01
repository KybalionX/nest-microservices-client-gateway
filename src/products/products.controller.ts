import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { PaginationDto } from 'src/common';
import { Services } from 'src/config';
import { ProductsMsCmd } from 'src/constants/microservices/products-ms/cmds';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(Services.NATS_SERVICE)
    private readonly natsClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.natsClient
      .send({ cmd: ProductsMsCmd.CREATE_PRODUCT }, createProductDto)
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }

  @Get()
  findAll(@Query() queryParams: PaginationDto) {
    return this.natsClient.send(
      { cmd: ProductsMsCmd.FIND_ALL_PRODUCTS },
      { page: queryParams.page, limit: queryParams.limit },
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.natsClient
      .send({ cmd: ProductsMsCmd.FIND_ONE_PRODUCT }, { id })
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.natsClient
      .send({ cmd: ProductsMsCmd.DELETE_PRODUCT }, { id })
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.natsClient
      .send({ cmd: ProductsMsCmd.UPDATE_PRODUCT }, { id, ...updateProductDto })
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }
}
