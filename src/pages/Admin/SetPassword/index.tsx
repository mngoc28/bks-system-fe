import { authApi } from '@/api/authApi';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ROUTERS } from '@/constant';
import { setPasswordFormSchema } from '@/shared/shema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * Set Password Page
 * A secure interface for users to establish their first password or update it via a verification token, ensuring account security through enforced complexity and confirmation.
 */
const SetPassword: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm({
        resolver: zodResolver(setPasswordFormSchema(t)),
        mode: "onChange",
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        if (!token) {
            setError(t('setPassword.invalid_token'));
        }
    }, [token, t]);

    const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
        if (!token) return;

        setLoading(true);
        setError('');
        try {
            await authApi.setPassword(token, values.password, values.confirmPassword);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || t('setPassword.error'));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg">
                    <div className="rounded-t-lg bg-blue-600 p-6 text-center text-white">
                        <h1 className="text-2xl font-semibold">{t('setPassword.welcome')}</h1>
                        <p className="mt-2 text-sm">{t('setPassword.subtitle')}</p>
                    </div>
                    <div className="p-6">
                        <p className="text-center text-green-600">{t('setPassword.success_message')}</p>
                        <Button
                            onClick={() => navigate(ROUTERS.LOGIN)}
                            className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {t('setPassword.go_to_login')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-lg rounded-lg bg-white shadow-lg">
                {/* Header */}
                <div className="rounded-t-lg bg-blue-600 p-6 text-center text-white">
                    <h1 className="text-2xl font-semibold">{t('setPassword.welcome')}</h1>
                    <p className="mt-2 text-sm">{t('setPassword.form_title')}</p>
                </div>

                {/* Content */}
                <div className="border border-t-0 border-gray-200 bg-gray-50 p-6">
                    {error && <p className="mb-4 text-red-600">{error}</p>}

                    <div className="mb-4">
                        <p className="text-gray-700">
                            {t('setPassword.description')}
                        </p>
                    </div>

                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)}>
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="mb-4">
                                        <FormLabel>{t('setPassword.password_label')}</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    {...field}
                                                    className="pr-10"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem className="mb-4">
                                        <FormLabel>{t('setPassword.confirm_password_label')}</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    {...field}
                                                    className="pr-10"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={loading || !token} className="w-full bg-blue-600 hover:bg-blue-700">
                                {loading ? t('setPassword.processing') : t('setPassword.submit_button')}
                            </Button>
                        </form>
                    </FormProvider>

                    <div className="mt-4 text-sm text-gray-600">
                        <p>{t('setPassword.password_note')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetPassword;