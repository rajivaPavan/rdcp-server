interface LoginResponseDto {
  email: string;
  role: string;
  jwt: string;
}

interface LoginV2ResponseDto {
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}