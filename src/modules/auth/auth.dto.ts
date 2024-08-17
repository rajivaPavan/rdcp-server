interface LoginDto{
    email: string;
    password: string;
}

interface ResetPasswordDto{
    email: string;
}

interface VerifyOtpDto{
    email: string;
    otp: string;
}

