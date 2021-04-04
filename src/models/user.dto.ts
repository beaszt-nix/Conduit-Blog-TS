import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

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

export class UserUpdateDTO {
  @IsOptional()
  @MinLength(4)
  @MaxLength(32)
  username: string;

  @IsOptional()
  @MinLength(5)
  @MaxLength(30)
  password: string;

  @IsOptional()
  @IsUrl()
  image: string | null;

  @IsOptional()
  bio: string;

  @IsOptional()
  @IsEmail()
  email: string;
}

export interface AuthPayload {
  username: string;
}
