// import React, { useState, useEffect } from 'react';
// import { X, Eye, EyeOff, UserPlus, Shield, Mail, Lock, CheckCircle2 } from 'lucide-react';
// import api from '../../constants/API/axiosInstance';

// const CreateAdminForm = ({ isOpen, onClose, onSuccess }) => {
//     const [formData, setFormData] = useState({
//         email: '',
//         permissionNames: []
//     });

//     const [permissions, setPermissions] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [errors, setErrors] = useState({});

//     useEffect(() => {
//         if (isOpen) {
//             fetchPermissions();
//         }
//     }, [isOpen]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!validateForm()) {
//             return;
//         }

//         setLoading(true);
//         try {
//             const response = await api.post("/admin/admins", {
//                 email: formData.email,
//                 permissionNames: formData.permissionNames,
//             });

//             const newAdmin = response.data;
//             onSuccess(newAdmin);
//             resetForm();
//             onClose();
//             toast.success("Admin created successfully");
//         } catch (error) {
//             console.error("Failed to create admin:", error);
//             const message =
//                 error.response?.data?.message || "Failed to create admin";
//             setErrors({ submit: message });
//             toast.error(message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchPermissions = async () => {
//         try {
//             const response = await api.get("/admin/permissions");
//             setPermissions(response.data);
//         } catch (error) {
//             console.error("Failed to fetch permissions:", error);
//             toast.error("Failed to fetch permissions");
//         }
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//         if (errors[name]) {
//             setErrors(prev => ({ ...prev, [name]: null }));
//         }
//     };

//     const handlePermissionToggle = (permissionName) => {
//         setFormData(prev => ({
//             ...prev,
//             permissionNames: prev.permissionNames.includes(permissionName)
//                 ? prev.permissionNames.filter(p => p !== permissionName)
//                 : [...prev.permissionNames, permissionName]
//         }));
//     };

//     const validateForm = () => {
//         const newErrors = {};

//         if (!formData.email) {
//             newErrors.email = 'Email is required';
//         } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//             newErrors.email = 'Email is invalid';
//         }


//         if (formData.permissionNames.length === 0) {
//             newErrors.permissions = 'At least one permission must be selected';
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

   

//     const resetForm = () => {
//         setFormData({
//             email: '',
          
//             permissionNames: []
//         });
//         setErrors({});
//     };

//     const handleClose = () => {
//         resetForm();
//         onClose();
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//                 <div className="flex items-center justify-between p-6 border-b">
//                     <div className="flex items-center space-x-3">
//                         <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
//                             <UserPlus className="w-6 h-6 text-blue-600" />
//                         </div>
//                         <div>
//                             <h2 className="text-xl font-semibold text-gray-900">Create New Admin</h2>
//                             <p className="text-sm text-gray-500">Add a new administrator with specific permissions</p>
//                         </div>
//                     </div>
//                     <button
//                         onClick={handleClose}
//                         className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                     >
//                         <X className="w-5 h-5" />
//                     </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                     {errors.submit && (
//                         <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
//                             {errors.submit}
//                         </div>
//                     )}

//                     {/* Email Field */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                             <Mail className="w-4 h-4 inline mr-2" />
//                             Email Address
//                         </label>
//                         <input
//                             type="email"
//                             name="email"
//                             value={formData.email}
//                             onChange={handleInputChange}
//                             className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                                 }`}
//                             placeholder="admin@example.com"
//                         />
//                         {errors.email && (
//                             <p className="mt-1 text-sm text-red-600">{errors.email}</p>
//                         )}
//                     </div>

                 

//                     {/* Permissions Section */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-3">
//                             <Shield className="w-4 h-4 inline mr-2" />
//                             Assign Permissions
//                         </label>
//                         <div className="border rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
//                             {permissions.length === 0 ? (
//                                 <p className="text-gray-500 text-center py-4">Loading permissions...</p>
//                             ) : (
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                                     {permissions.map((permission) => (
//                                         <label
//                                             key={permission.id}
//                                             className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
//                                         >
//                                             <input
//                                                 type="checkbox"
//                                                 checked={formData.permissionNames.includes(permission.name)}
//                                                 onChange={() => handlePermissionToggle(permission.name)}
//                                                 className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                                             />
//                                             <div className="flex-1 min-w-0">
//                                                 <div className="flex items-center space-x-2">
//                                                     <span className="text-sm font-medium text-gray-900">
//                                                         {permission.name}
//                                                     </span>
//                                                     {formData.permissionNames.includes(permission.name) && (
//                                                         <CheckCircle2 className="w-4 h-4 text-green-500" />
//                                                     )}
//                                                 </div>
//                                                 {permission.description && (
//                                                     <p className="text-xs text-gray-500 mt-1">
//                                                         {permission.description}
//                                                     </p>
//                                                 )}
//                                             </div>
//                                         </label>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                         {errors.permissions && (
//                             <p className="mt-1 text-sm text-red-600">{errors.permissions}</p>
//                         )}
//                         <div className="mt-2 text-xs text-gray-500">
//                             Selected: {formData.permissionNames.length} permission(s)
//                         </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
//                         <button
//                             type="button"
//                             onClick={handleClose}
//                             className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
//                         >
//                             {loading ? (
//                                 <>
//                                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                                     Creating...
//                                 </>
//                             ) : (
//                                 <>
//                                     <UserPlus className="w-4 h-4 mr-2" />
//                                     Create Admin
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default CreateAdminForm;



import React, { useState, useEffect } from 'react';
import { X, UserPlus, Shield, Mail, CheckCircle2, ChevronDown, ChevronRight, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../constants/API/axiosInstance';

const CreateAdminForm = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        permissionNames: []
    });

    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [expandedModules, setExpandedModules] = useState(new Set());
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchPermissions();
        }
    }, [isOpen]);

    const fetchPermissions = async () => {
        try {
            const response = await api.get("/admin/permissions/hierarchical");
            const permissionsData = response.data || [];
            setPermissions(permissionsData);

            // Auto-expand modules that have children
            const modulesToExpand = new Set();
            permissionsData.forEach(permission => {
                if (permission.children && permission.children.length > 0) {
                    modulesToExpand.add(permission.id);
                }
            });
            setExpandedModules(modulesToExpand);
        } catch (error) {
            console.error("Failed to fetch permissions:", error);
            toast.error("Failed to fetch permissions");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("/admin/admins", {
                email: formData.email,
                password: formData.password,
                permissionNames: formData.permissionNames,
            });

            const newAdmin = response.data;
            onSuccess(newAdmin);
            resetForm();
            toast.success("Administrator created successfully");
        } catch (error) {
            console.error("Failed to create admin:", error);
            const message = error.response?.data?.message || "Failed to create administrator";
            setErrors({ submit: message });
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handlePermissionToggle = (permissionName) => {
        setFormData(prev => ({
            ...prev,
            permissionNames: prev.permissionNames.includes(permissionName)
                ? prev.permissionNames.filter(p => p !== permissionName)
                : [...prev.permissionNames, permissionName]
        }));
    };

    const handleModuleToggle = (module) => {
        const moduleChildren = module.children?.map(child => child.name) || [];
        const allSelected = moduleChildren.every(childName =>
            formData.permissionNames.includes(childName)
        );

        if (allSelected) {
            // Unselect all children
            setFormData(prev => ({
                ...prev,
                permissionNames: prev.permissionNames.filter(name =>
                    !moduleChildren.includes(name)
                )
            }));
        } else {
            // Select all children
            setFormData(prev => ({
                ...prev,
                permissionNames: [...new Set([...prev.permissionNames, ...moduleChildren])]
            }));
        }
    };

    const toggleModuleExpansion = (moduleId) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirm password is required';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (formData.permissionNames.length === 0) {
            newErrors.permissions = 'At least one permission must be selected';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            permissionNames: []
        });
        setErrors({});
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    // Separate modules (parents) from standalone permissions
    const modules = permissions.filter(p => p.children && p.children.length > 0);
    const standalonePermissions = permissions.filter(p =>
        (!p.children || p.children.length === 0) &&
        !permissions.some(parent => parent.children?.some(child => child.id === p.id))
    );

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                            <UserPlus className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Create New Administrator</h2>
                            <p className="text-sm text-gray-600">Add a new administrator with specific permissions</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {errors.submit && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center">
                            <X className="w-4 h-4 mr-2 text-red-500" />
                            {errors.submit}
                        </div>
                    )}

                    {/* Email Field */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email Address *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                                }`}
                            placeholder="admin@example.com"
                        />
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                <X className="w-4 h-4 mr-1" />
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password Fields */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    <Lock className="w-4 h-4 inline mr-2" />
                                    Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                                            }`}
                                        placeholder="Enter password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <X className="w-4 h-4 mr-1" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    <Lock className="w-4 h-4 inline mr-2" />
                                    Confirm Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                                            }`}
                                        placeholder="Confirm password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <X className="w-4 h-4 mr-1" />
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                <Shield className="w-4 h-4 inline mr-2" />
                                Assign Permissions *
                            </label>
                            <div className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                                {formData.permissionNames.length} selected
                            </div>
                        </div>

                        {permissions.length === 0 ? (
                            <div className="border rounded-lg p-8 text-center bg-gray-50">
                                <div className="animate-pulse">
                                    <Shield className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-500">Loading permissions...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
                                {/* Permission Modules Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {modules.map((module) => {
                                        const moduleChildren = module.children || [];
                                        const selectedChildren = moduleChildren.filter(child =>
                                            formData.permissionNames.includes(child.name)
                                        );
                                        const allSelected = moduleChildren.length > 0 &&
                                            selectedChildren.length === moduleChildren.length;
                                        const partiallySelected = selectedChildren.length > 0 &&
                                            selectedChildren.length < moduleChildren.length;

                                        return (
                                            <div key={module.id} className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                                                <div
                                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                                    onClick={() => toggleModuleExpansion(module.id)}
                                                >
                                                    <div className="flex items-center space-x-3 flex-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={allSelected}
                                                            ref={input => {
                                                                if (input) input.indeterminate = partiallySelected;
                                                            }}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                handleModuleToggle(module);
                                                            }}
                                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <div className="flex items-center space-x-2">
                                                            <Shield className="w-5 h-5 text-blue-600" />
                                                            <div>
                                                                <span className="text-sm font-semibold text-gray-800">
                                                                    {module.name}
                                                                </span>
                                                                <div className="flex items-center space-x-2 mt-1">
                                                                    <span className="text-xs text-gray-500">
                                                                        {selectedChildren.length}/{moduleChildren.length} selected
                                                                    </span>
                                                                    {selectedChildren.length > 0 && (
                                                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {expandedModules.has(module.id) ? (
                                                            <ChevronDown className="w-4 h-4 text-gray-500" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 text-gray-500" />
                                                        )}
                                                    </div>
                                                </div>

                                                {module.description && (
                                                    <div className="px-4 pb-2">
                                                        <p className="text-xs text-gray-600">
                                                            {module.description}
                                                        </p>
                                                    </div>
                                                )}

                                                {expandedModules.has(module.id) && (
                                                    <div className="border-t bg-gray-50 p-3 space-y-2">
                                                        {moduleChildren.map((child) => (
                                                            <label
                                                                key={child.id}
                                                                className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.permissionNames.includes(child.name)}
                                                                    onChange={() => handlePermissionToggle(child.name)}
                                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className="text-sm font-medium text-gray-700">
                                                                            {child.name}
                                                                        </span>
                                                                        {formData.permissionNames.includes(child.name) && (
                                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                                        )}
                                                                    </div>
                                                                    {child.description && (
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            {child.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Standalone Permissions */}
                                {standalonePermissions.length > 0 && (
                                    <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                            <Shield className="w-4 h-4 mr-2" />
                                            Individual Permissions
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {standalonePermissions.map((permission) => (
                                                <label
                                                    key={permission.id}
                                                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.permissionNames.includes(permission.name)}
                                                        onChange={() => handlePermissionToggle(permission.name)}
                                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {permission.name}
                                                            </span>
                                                            {formData.permissionNames.includes(permission.name) && (
                                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            )}
                                                        </div>
                                                        {permission.description && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {permission.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {errors.permissions && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                <X className="w-4 h-4 mr-1" />
                                {errors.permissions}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Creating Administrator...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Create Administrator
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAdminForm;