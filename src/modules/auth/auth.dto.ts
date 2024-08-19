interface LoginDto{
    email: string;
    password: string;
}

interface LoginResponseDto{
    email: string;
    role: string;
    jwt: string;
}
