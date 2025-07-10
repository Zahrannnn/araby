"use client"

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authApi } from '@/lib/api';

// Login form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // Call the login API
      const response = await authApi.login(
        { email: data.email, password: data.password },
        data.rememberMe || false
      );

      // The authApi.login already stores the token and user data in cookies
      console.log('Login successful:', {
        user: response.user,
        role: response.role,
        expireAt: response.expireAt
      });

      // Redirect to dashboard based on user role
      let redirectPath = '/dashboard';
      
      // You can customize redirect based on role if needed
      switch (response.role) {
        case 'SuperAdmin':
          redirectPath = '/super-admin';
          break;
        case 'Manager':
          redirectPath = '/company';
          break;
        case 'Employee':
          redirectPath = '/employee/dashboard';
          break;
        default:
          redirectPath = '/dashboard';
      }

      router.push(redirectPath);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-10 rounded-lg border-gray-200 border">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image 
              src="https://i.postimg.cc/PfWyMjKv/image-removebg-preview.png" 
              alt="NEDX Logo" 
              width={120} 
              height={60} 
              className="h-auto w-auto"
            />
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-lg">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to CRM System
            </h1>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 border border-red-300 bg-red-50 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <Label htmlFor="email" className="text-gray-700 mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="user@example.com"
                className={`h-12 text-base ${errors.email ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password" className="text-gray-700 mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className={`h-12 text-base pr-12 ${errors.password ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <Checkbox 
                id="remember-me" 
                className="mr-3" 
                checked={rememberMe}
                onCheckedChange={(checked) => setValue('rememberMe', !!checked)}
                disabled={isLoading}
              />
              <Label htmlFor="remember-me" className="text-sm text-gray-700">
                Remember me
              </Label>
            </div>

            {/* Login Button */}
            <div>
              <Button
                type="submit"
                className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-medium text-base shadow-sm transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2025 CRM System. All rights reserved. | Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;