// src/pages/ForgotPassword.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, FormInput } from '../Forms/Common/common';
import { toast } from 'react-toastify';
import api from "../../constants/API/axiosInstance";

const ForgotPassword = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        defaultValues: { email: "" },
    });

    const onSubmit = async (formData) => {
        try {
            const res = await api.post(
                "/users/forgot-password",
                null,
                { params: { email: formData.email } }
            );

            toast.success(res.data || "Password reset link sent to your email.");
            reset();
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data || "Failed to send reset link.");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-500 to-gray-950 flex items-center justify-center p-5">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md animate-fadeInUp">
                <div className="bg-gradient-to-br from-blue-500 via-black to-indigo-600 text-white px-8 py-10 text-center">
                    <h1 className="text-3xl font-semibold mb-2">Forgot Password</h1>
                    <p className="text-blue-100 text-base">
                        Enter your email to receive a password reset link
                    </p>
                </div>
                <div className="p-8 space-y-6">
                    <FormInput
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        register={register}
                        errors={errors}
                        validation={{
                            required: "Email is required",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address",
                            },
                        }}
                    />
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        variant="primary"
                        onClick={handleSubmit(onSubmit)}
                    >
                        {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </Button>

                    <div className="text-center">
                        <Button variant="link" onClick={() => window.history.back()}>
                            Back to Login
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
