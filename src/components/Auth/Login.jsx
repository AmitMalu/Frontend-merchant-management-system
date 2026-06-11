// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { useNavigate } from 'react-router';
// import axios from 'axios';
// import { toast } from 'react-toastify'
// import { Button, FormInput } from '../Forms/Common/common';
// import api from '../../constants/API/axiosInstance';
// import { Eye, EyeOff } from 'lucide-react';
// import logoImage from '../../assets/SD.jpg';



// const Login = () => {
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);


//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     reset,
//   } = useForm({
//     defaultValues: { email: "", password: "" },
//   });

//   const onSubmit = async (formData) => {
//     try {
//       const { data, status } = await api.post("/users/login", formData);

//       if (status === 200) {
//         localStorage.setItem("authToken", data.token);
//         localStorage.setItem("userType", data.role);
//         localStorage.setItem("userEmail", data.email);
//         localStorage.setItem("firstLogin", data.firstLogin);
//         if (data.role === "ADMIN" || data.role === "SUPER_ADMIN") {
//           // save permissions only for admins
//           localStorage.setItem("permissions", JSON.stringify(data.permissions));
//         } else {
//           localStorage.removeItem("permissions"); // cleanup
//         }

//         toast.success("Login successful!");
//         reset();
//         //navigate("/dashboard");
//         window.location.href = '/dashboard';
//       }
//     } catch (error) {
//       console.error("Login Error:", error?.response?.data?.error || error.message);
//       toast.error(error?.response?.data?.error || "Login failed. Please try again.");
//     }

//   };

//   const handleForgotPassword = () => {
//     navigate("/forgot-pass")
//   };

//   // Handle Enter key press
//   const handleKeyPress = (event) => {
//     if (event.key === 'Enter' && !isSubmitting) {
//       event.preventDefault();
//       handleSubmit(onSubmit)();
//     }
//   };



//   return (
// <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-300 via-gray-500 to-blue-100">
//   {/* Main Content */}
//   <div className="flex-grow flex items-center justify-center p-5">
//     <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl flex animate-fadeInUp">
      
//       {/* Left Side - Logo Section */}
//       <div className="hidden md:flex md:w-1/2 bg-gradient-to-r from-[#141921] to-[#303a47] items-center justify-center p-12">
//         <div className="text-center">
//           <img
//             src={logoImage}
//             alt="Same Day Solution Logo"
//             className="w-fit max-w-xs mx-auto mix-blend-lighten"
//           />
//         </div>
//       </div>

//       {/* Right Side - Login Form */}
//       <div className="w-full md:w-1/2">
//         {/* Header */}
//         <div className="bg-[#303a47] text-blue-500 px-8 py-10 text-center">
//           <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
//           <p className="text-gray-300 text-base">
//             Sign in to continue to your account
//           </p>
//         </div>

//         {/* Form */}
//         <div className="pl-8 pr-10 pb-8 pt-2 bg-[#303a47]">
//           <form onSubmit={handleSubmit(onSubmit)} onKeyPress={handleKeyPress}>
//             <div className="space-y-6">
//               {/* Email Field */}
//               <FormInput
//                 className="bg-gray-300"
//                 label="Email Address"
//                 name="email"
//                 type="email"
//                 placeholder="Enter your email"
//                 register={register}
//                 errors={errors}
//                 validation={{
//                   required: "Email is required",
//                   pattern: {
//                     value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                     message: "Invalid email address"
//                   }
//                 }}
//               />

//               {/* Password Field */}
//               <FormInput
//                 className="bg-gray-300 mb-8"
//                 label="Password"
//                 name="password"
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Enter your password"
//                 register={register}
//                 errors={errors}
//                 validation={{
//                   required: "Password is required",
//                   minLength: { value: 6, message: "Password must be at least 6 characters" }
//                 }}
//                 rightIcon={
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(prev => !prev)}
//                     className="text-gray-500 mb-8 hover:text-gray-700"
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 }
//               />

//               {/* Submit Button */}
//               <Button
//                 type="submit"
//                 disabled={isSubmitting}
//                 variant="primary"
//               >
//                 {isSubmitting ? "Signing In..." : "Sign In"}
//               </Button>

//               {/* Forgot Password */}
//               <div className="text-center">
//                 <Button variant="link" onClick={handleForgotPassword}>
//                   Forgot your password?
//                 </Button>
//               </div>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   </div>

//   {/* Footer */}
//   <footer className="text-center py-2 bg-gradient-to-br from-gray-500 to-gray-700">
//     <p className="text-white text-xs tracking-wide">
//       © {new Date().getFullYear()}{" "}
//       <span className="font-medium">Powered by Shashwat Infotech Pvt. Ltd.</span>
//     </p>
//   </footer>
// </div>

    
//   );
  
// };


// export default Login;
<div className="bg-red-600 text-white p-6 text-center text-2xl">
  Tailwind Working
</div>

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { toast } from 'react-toastify'
import { Button, FormInput } from '../Forms/Common/common';
import api from '../../constants/API/axiosInstance';
import { Eye, EyeOff } from 'lucide-react';
import logoImage from '../../assets/SD.png';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (formData) => {
    try {
      const { data, status } = await api.post("/users/login", formData);

      if (status === 200) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userType", data.role);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("firstLogin", data.firstLogin || "false");

        if (data.role === "ADMIN" || data.role === "SUPER_ADMIN") {
          localStorage.setItem("permissions", JSON.stringify(data.permissions));
        } else {
          localStorage.removeItem("permissions");
        }

        // ✅ Handle password expiry warning
        if (data.passwordExpiryWarning) {
          localStorage.setItem("passwordExpiryWarning", data.passwordExpiryWarning);
          localStorage.setItem("daysLeftForPasswordExpiry", data.daysLeftForPasswordExpiry);
        } else {
          localStorage.removeItem("passwordExpiryWarning");
          localStorage.removeItem("daysLeftForPasswordExpiry");
        }

        toast.success("Login successful!");
        reset();
        window.location.href = '/dashboard';
      }
    } catch (error) {
      // ✅ Handle password expired case (HTTP 428 - Precondition Required)
      if (error?.response?.status === 428 && error?.response?.data?.passwordExpired) {
        toast.error("Your password has expired. Please reset your password.");

        // Store email for password reset flow
        localStorage.setItem("expiredPasswordEmail", error.response.data.email);

        // Navigate to password reset page
        navigate("/reset-password-expired");
        return;
      }

      console.error("Login Error:", error?.response?.data?.error || error.message);
      toast.error(error?.response?.data?.error || "Login failed. Please try again.");
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-pass");
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !isSubmitting) {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-300 via-gray-500 to-blue-100">
      <div className="flex-grow flex items-center justify-center p-5">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl flex animate-fadeInUp">

          <div className="hidden md:flex md:w-1/2 bg-gradient-to-r from-[#141921] to-[#303a47] items-center justify-center p-12">
            <div className="text-center">
              <img
                src="https://tse1.explicit.bing.net/th/id/OIP.I5BlfjjUo-Nipl3YqCsNvQHaFW?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
                alt="Logo"
                className="w-fit max-w-xs mx-auto object-contain rounded-lg"
              />
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <div className="bg-[#303a47] text-blue-500 px-8 py-10 text-center">
              <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
              <p className="text-gray-300 text-base">
                Sign in to continue to your account
              </p>
            </div>

            <div className="pl-8 pr-10 pb-8 pt-2 bg-[#303a47]">
              <form onSubmit={handleSubmit(onSubmit)} onKeyPress={handleKeyPress}>
                <div className="space-y-6">
                  <FormInput
                    className="bg-gray-300"
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
                        message: "Invalid email address"
                      }
                    }}
                  />

                  <FormInput
                    className="bg-gray-300 mb-8"
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    register={register}
                    errors={errors}
                    validation={{
                      required: "Password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" }
                    }}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="text-gray-500 mb-8 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    }
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="primary"
                  >
                    {isSubmitting ? "Signing In..." : "Sign In"}
                  </Button>

                  <div className="text-center">
                    <Button variant="link" onClick={handleForgotPassword}>
                      Forgot your password?
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

export default Login;