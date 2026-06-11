import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Button, FormInput } from '../Forms/Common/common';
import api from '../../constants/API/axiosInstance';
import { Eye, EyeOff, KeyRound, AlertTriangle } from 'lucide-react';
import logoImage from '../../assets/SD.png';

const ResetPasswordExpired = () => {
    const navigate = useNavigate();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        reset,
    } = useForm({
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    useEffect(() => {
        // Get the email from localStorage (set during failed login)
        const expiredEmail = localStorage.getItem("expiredPasswordEmail");
        if (!expiredEmail) {
            toast.error("No email found. Redirecting to login...");
            navigate("/login");
            return;
        }
        setEmail(expiredEmail);
    }, [navigate]);

    const newPassword = watch("newPassword");

    const onSubmit = async (formData) => {
        try {
            // Call the change-password endpoint with expired password flag
            const response = await api.post("/users/change-password", {
                email: email,
                newPassword: formData.newPassword,
                isFirstLogin: true, // Treat like first login - no current password needed
            });

            if (response.status === 200) {
                toast.success("Password updated successfully! Please login with your new password.");

                // Clean up localStorage
                localStorage.removeItem("expiredPasswordEmail");
                localStorage.removeItem("passwordExpiryWarning");
                localStorage.removeItem("daysLeftForPasswordExpiry");

                reset();

                // Redirect to login after brief delay
                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            }
        } catch (error) {
            console.error("Password Reset Error:", error?.response?.data?.error || error.message);
            toast.error(error?.response?.data?.error || "Failed to reset password. Please try again.");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-300 via-gray-500 to-blue-100">
            <div className="flex-grow flex items-center justify-center p-5">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl flex animate-fadeInUp">

                    {/* Left Side - Logo & Warning */}
                    <div className="hidden md:flex md:w-1/2 bg-gradient-to-r from-[#141921] to-[#303a47] items-center justify-center p-12">
                        <div className="text-center space-y-6">
                            <img
                                src="https://tse1.explicit.bing.net/th/id/OIP.I5BlfjjUo-Nipl3YqCsNvQHaFW?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
                                alt="Logo"
                                className="w-fit max-w-xs mx-auto object-contain rounded-lg"
                            />
                            <div className="bg-red-500/20 border border-red-500 rounded-lg py-2 scale-80">
                                <AlertTriangle className="text-red-400 mx-auto" size={48} />
                                <p className="text-red-200 text-sm">
                                    Your password has expired for security reasons
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Reset Form */}
                    <div className="w-full md:w-1/2 bg-[#303a47]">
                        {/* Header */}
                        <div className=" text-red-400 mt-4  text-center">
                            <div className='flex items-center justify-center'>
                                <KeyRound className="" size={20} />
                            <h1 className="text-2xl font-semibold">Password Expired</h1>
                            </div>
                            <div className=''>
                                <p className="text-gray-300 text-sm ">
                                Please set a new password to continue
                            </p>
                            <p className="text-sm text-gray-400 ">
                                {email}
                            </p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="pl-8 pr-10 pb-9 pt-4 ">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="space-y-4">
                                    {/* Warning Message */}
                                    <div className="bg-red-50 border border-red-200 scale-85 rounded-lg p-4">
                                        <div className="flex items-start gap-3 ">
                                            <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                            <div className="text-sm text-red-800">
                                                <p className="font-semibold mb-1">Password Security Requirements:</p>
                                                <ul className="list-disc list-inside space-y-1 text-xs">
                                                    <li>At least 8 characters long</li>
                                                    <li>Must be different from your previous password</li>
                                                    <li>Will expire in 90 days</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* New Password Field */}
                                    <FormInput
                                        className="bg-gray-300"
                                        label="New Password"
                                        name="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Enter your new password"
                                        register={register}
                                        errors={errors}
                                        validation={{
                                            required: "New password is required",
                                            minLength: {
                                                value: 8,
                                                message: "Password must be at least 8 characters"
                                            }
                                        }}
                                        rightIcon={
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(prev => !prev)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        }
                                    />

                                    {/* Confirm Password Field */}
                                    <FormInput
                                        className="bg-gray-300"
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your new password"
                                        register={register}
                                        errors={errors}
                                        validation={{
                                            required: "Please confirm your password",
                                            validate: (value) =>
                                                value === newPassword || "Passwords do not match"
                                        }}
                                        rightIcon={
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(prev => !prev)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        }
                                    />

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        variant="primary"
                                        className="w-full"
                                    >
                                        {isSubmitting ? "Updating Password..." : "Update Password"}
                                    </Button>

                                    {/* Back to Login */}
                                    <div className="text-center">
                                        <Button
                                            variant="link"
                                            onClick={() => navigate("/login")}
                                            disabled={isSubmitting}
                                        >
                                            Back to Login
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

           <footer className="text-center py-2 bg-gradient-to-br from-gray-500 to-gray-700">
        <p className="text-white text-xs tracking-wide">
          © {new Date().getFullYear()}{" "}
          <span className="font-medium">Powered by Shashwat Infotech Pvt. Ltd.</span>
        </p>
      </footer>
        </div>
    );
};

export default ResetPasswordExpired;