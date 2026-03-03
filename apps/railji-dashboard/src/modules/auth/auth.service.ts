import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@libs';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { username, password } = signInDto;

    const user = await this.userModel.findOne({ 
      username, 
      userType: 'admin' 
    }).exec();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials or not an admin user');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials or not an admin user');
    }

    const payload = { 
      sub: user._id, 
      username: user.username,
      userType: user.userType 
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user._id,
        username: user.username,
        userType: user.userType,
      },
    };
  }
}
