import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { Services } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { AuthMsCmd } from 'src/constants/microservices/auth-ms/cmds';
import { RegisterUserDto } from './dtos/register-user.dto';
import { LoginUserDto } from './dtos';
import { catchError } from 'rxjs';
import { AuthGuard } from './guards/auth.guard';
import { User } from './decorators';
import { CurrentUser } from './interfaces/current-user.interface';
import { Token } from './decorators/token.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(Services.NATS_SERVICE)
    private readonly natsClient: ClientProxy,
  ) {}

  @Post('register')
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.natsClient.send(AuthMsCmd.REGISTER_USER, registerUserDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.natsClient.send(AuthMsCmd.LOGIN_USER, loginUserDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @UseGuards(AuthGuard)
  @Get('verify')
  verifyUser(@User() user: CurrentUser, @Token() token: string) {
    return {
      user,
      token,
    };
    return this.natsClient.send(AuthMsCmd.VERIFY_USER, {});
  }
}
