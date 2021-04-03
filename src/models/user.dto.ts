import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDTO {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(5)
  @MaxLength(30)
  password: string;
}

export class RegisterDTO extends LoginDTO {
  @IsString()
  @MinLength(4)
  @MaxLength(32)
  username: string;
}

export interface AuthPayload {
  username: string;
}
