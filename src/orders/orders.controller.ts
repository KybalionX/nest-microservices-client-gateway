import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  ParseIntPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { Services } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrdersMsCmd } from 'src/constants/microservices/orders-ms/cmds';
import { CreateOrderDto, OrderPaginationDto } from './dto';
import { catchError } from 'rxjs';
import { StatusDto } from './dto/status.dto';
import { PaginationDto } from 'src/common';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(Services.NATS_SERVICE)
    private readonly natsClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.natsClient.send(OrdersMsCmd.CREATE_ORDER, createOrderDto);
  }

  @Get()
  findAll(@Query() orderPagination: OrderPaginationDto) {
    return this.natsClient
      .send(OrdersMsCmd.FIND_ALL_ORDERS, orderPagination)
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }

  @Get('id/:id')
  findOneById(@Param('id', ParseIntPipe) id: number) {
    return this.natsClient.send(OrdersMsCmd.FIND_ONE_ORDER, id).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }

  @Get('status/:status')
  findByStatus(
    @Param() statusDto: StatusDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.natsClient
      .send(OrdersMsCmd.FIND_ALL_ORDERS, {
        ...paginationDto,
        status: statusDto.status,
      })
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }

  @Patch(':id')
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: StatusDto,
  ) {
    return this.natsClient
      .send(OrdersMsCmd.CHANGE_ORDER_STATUS, {
        id,
        status: statusDto.status,
      })
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }
}
