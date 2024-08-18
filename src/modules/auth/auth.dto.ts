interface LoginDto{
    email: string;
    password: string;
}
interface ResetPasswordDto{
    email: string;
    otp: string;
    password: string;
}

interface VerifyOtpDto{
    email: string;
    otp: string;
}

