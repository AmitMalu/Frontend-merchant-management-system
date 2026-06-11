// src/pages/ResetPassword.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { Button, FormInput } from "../Forms/Common/common";
import { toast } from "react-toastify";
import { useSearchParams, useNavigate } from "react-router";
import api from "../../constants/API/axiosInstance";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    const onSubmit = async (formData) => {
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const res = await api.post("/users/reset-password", null, {
                params: {
                        token,
                        newPassword: formData.newPassword,
                    },
                }
            );

            toast.success(res.data || "Password reset successful. Please login.");
            reset();
            navigate("/login");
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data || "Reset failed. Token may be invalid or expired.");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-500 to-gray-950 flex items-center justify-center p-5">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md animate-fadeInUp">
                <div className="bg-gradient-to-br from-blue-500 via-black to-indigo-600 text-white px-8 py-10 text-center">
                    <h1 className="text-3xl font-semibold mb-2">Reset Password</h1>
                    <p className="text-indigo-100 text-base">Enter your new password</p>
                </div>
                <div className="p-8 space-y-6">
                    <FormInput
                        label="New Password"
                        name="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        register={register}
                        errors={errors}
                        validation={{
                            required: "Password is required",
                            minLength: {
                                value: 8,
                                message: "Password must be at least 8 characters",
                            },
                        }}
                    />
                    <FormInput
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        register={register}
                        errors={errors}
                        validation={{
                            required: "Confirm Password is required",
                        }}
                    />
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        variant="primary"
                        onClick={handleSubmit(onSubmit)}
                    >
                        {isSubmitting ? "Resetting..." : "Reset Password"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
