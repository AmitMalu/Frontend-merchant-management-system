// import React, { useState, useEffect } from 'react';
// import { Shield, User, Clock, Crown, Settings, CheckCircle, XCircle } from 'lucide-react';
// import api from '../../constants/API/axiosInstance';
// import { toast } from 'react-toastify';

// const UserPermissionsPage = () => {
//     const [userInfo, setUserInfo] = useState(null);
//     const [permissions, setPermissions] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         fetchUserPermissions();
//     }, []);

//     const fetchUserPermissions = async () => {
//         setLoading(true);
//         setError(null);

//         try {
//             const response = await api.get("/admin/admins/my-permissions");

//             // Since the API returns only permissions array, we need to get user info separately
//             // or construct it from localStorage/context
//             const userEmail = localStorage.getItem('userEmail') || 'Unknown';
//             const userType = localStorage.getItem('userType');
//             const userId = localStorage.getItem('userId');

//             setUserInfo({
//                 email: userEmail,
//                 id: userId,
//                 userType: userType,
//                 createdAt: new Date().toISOString() // Placeholder
//             });

//             setPermissions(response.data || []);
//         } catch (error) {
//             console.error("Failed to fetch user permissions:", error);
//             const message = error.response?.data?.message || "Failed to fetch user information";
//             setError(message);
//             toast.error(message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getRoleInfo = () => {
//         const userType = userInfo?.userType || localStorage.getItem('userType');

//         if (userType === 'SUPER_ADMIN') {
//             return {
//                 type: 'SUPER_ADMIN',
//                 label: 'Super Administrator',
//                 color: 'red',
//                 icon: Crown
//             };
//         } else if (userType === 'ADMIN') {
//             return {
//                 type: 'ADMIN',
//                 label: 'Administrator',
//                 color: 'blue',
//                 icon: Shield
//             };
//         } else {
//             return {
//                 type: 'USER',
//                 label: 'User',
//                 color: 'gray',
//                 icon: User
//             };
//         }
//     };

//     const groupPermissionsByCategory = (permissions) => {
//         const groups = {};

//         permissions.forEach(permission => {
//             const category = permission.name.split('_')[0] || 'GENERAL';
//             if (!groups[category]) {
//                 groups[category] = [];
//             }
//             groups[category].push(permission);
//         });

//         return groups;
//     };

//     const getCategoryIcon = (category) => {
//         const icons = {
//             CREATE: CheckCircle,
//             VIEW: User,
//             MANAGE: Settings,
//             APPROVE: CheckCircle,
//             DELETE: XCircle,
//             SYSTEM: Settings
//         };
//         return icons[category] || Shield;
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//                     <p className="text-gray-600">Loading your permissions...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//                 <div className="text-center">
//                     <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//                     <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Permissions</h2>
//                     <p className="text-gray-600 mb-4">{error}</p>
//                     <button
//                         onClick={fetchUserPermissions}
//                         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                     >
//                         Try Again
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     const roleInfo = getRoleInfo();
//     const RoleIcon = roleInfo.icon;
//     const permissionGroups = groupPermissionsByCategory(permissions);
//     const isSuperAdmin = roleInfo.type === 'SUPER_ADMIN';

//     return (
//         <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//             <div className="max-w-6xl mx-auto space-y-6">
//                 {/* Header */}
//                 <div className="bg-white rounded-lg shadow p-6">
//                     <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
//                         <div>
//                             <h1 className="text-2xl font-bold text-gray-900">My Permissions</h1>
//                             <p className="text-gray-600 mt-1">View your current role and access permissions</p>
//                         </div>
//                         <div className="flex items-center space-x-3">
//                             <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
//                                 <span className="text-lg font-semibold text-gray-700">
//                                     {userInfo?.email?.charAt(0).toUpperCase() || 'U'}
//                                 </span>
//                             </div>
//                             <div>
//                                 <p className="text-sm font-medium text-gray-900">{userInfo?.email}</p>
//                                 <p className="text-xs text-gray-500">ID: {userInfo?.id}</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Role Information */}
//                 <div className="bg-white rounded-lg shadow p-6">
//                     <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Information</h2>

//                     <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
//                         <div className="flex items-center space-x-4">
//                             <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${roleInfo.color === 'red' ? 'bg-red-100' :
//                                     roleInfo.color === 'blue' ? 'bg-blue-100' : 'bg-gray-100'
//                                 }`}>
//                                 <RoleIcon className={`w-6 h-6 ${roleInfo.color === 'red' ? 'text-red-600' :
//                                         roleInfo.color === 'blue' ? 'text-blue-600' : 'text-gray-600'
//                                     }`} />
//                             </div>
//                             <div>
//                                 <h3 className="text-xl font-semibold text-gray-900">{roleInfo.label}</h3>
//                                 <p className="text-gray-600">
//                                     {isSuperAdmin ?
//                                         'Full system access with all permissions' :
//                                         `${permissions.length} specific permission(s) granted`
//                                     }
//                                 </p>
//                             </div>
//                         </div>

//                         <div className="flex items-center space-x-4 text-sm text-gray-500">
//                             <div className="flex items-center space-x-1">
//                                 <Clock className="w-4 h-4" />
//                                 <span>Current session</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Permissions */}
//                 <div className="bg-white rounded-lg shadow">
//                     <div className="p-6 border-b border-gray-200">
//                         <h2 className="text-lg font-semibold text-gray-900">Access Permissions</h2>
//                         <p className="text-gray-600 mt-1">
//                             {isSuperAdmin ?
//                                 'As a Super Administrator, you have unrestricted access to all system features.' :
//                                 'These are the specific permissions granted to your account.'
//                             }
//                         </p>
//                     </div>

//                     <div className="p-6">
//                         {isSuperAdmin ? (
//                             <div className="text-center py-12">
//                                 <Crown className="w-16 h-16 text-red-500 mx-auto mb-4" />
//                                 <h3 className="text-xl font-semibold text-gray-900 mb-2">Super Administrator Access</h3>
//                                 <p className="text-gray-600 max-w-md mx-auto">
//                                     You have complete administrative access to all features and functions within the system.
//                                     No permission restrictions apply to your account.
//                                 </p>
//                             </div>
//                         ) : permissions.length === 0 ? (
//                             <div className="text-center py-12">
//                                 <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//                                 <h3 className="text-xl font-semibold text-gray-900 mb-2">No Permissions Assigned</h3>
//                                 <p className="text-gray-600 max-w-md mx-auto">
//                                     You currently have no specific permissions assigned to your account.
//                                     Contact your system administrator for access to features.
//                                 </p>
//                             </div>
//                         ) : (
//                             <div className="space-y-6">
//                                 {Object.entries(permissionGroups).map(([category, categoryPermissions]) => {
//                                     const CategoryIcon = getCategoryIcon(category);

//                                     return (
//                                         <div key={category} className="border border-gray-200 rounded-lg p-4">
//                                             <div className="flex items-center space-x-3 mb-4">
//                                                 <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
//                                                     <CategoryIcon className="w-4 h-4 text-blue-600" />
//                                                 </div>
//                                                 <h3 className="text-lg font-medium text-gray-900 capitalize">
//                                                     {category.toLowerCase()} Permissions
//                                                 </h3>
//                                                 <span className="text-sm text-gray-500">
//                                                     ({categoryPermissions.length})
//                                                 </span>
//                                             </div>

//                                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                                                 {categoryPermissions.map((permission) => (
//                                                     <div
//                                                         key={permission.id}
//                                                         className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg"
//                                                     >
//                                                         <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
//                                                         <div className="min-w-0 flex-1">
//                                                             <p className="text-sm font-medium text-gray-900">
//                                                                 {permission.name}
//                                                             </p>
//                                                             {permission.description && (
//                                                                 <p className="text-xs text-gray-600 mt-1">
//                                                                     {permission.description}
//                                                                 </p>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Security Notice */}
//                 {!isSuperAdmin && (
//                     <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
//                         <div className="flex items-start space-x-3">
//                             <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
//                             <div>
//                                 <h3 className="text-sm font-medium text-amber-800">Security Notice</h3>
//                                 <p className="text-sm text-amber-700 mt-1">
//                                     Your access is restricted to the permissions listed above. If you need additional
//                                     access to perform your duties, please contact your system administrator.
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default UserPermissionsPage;


import React, { useState, useEffect } from 'react';
import { Shield, User, Clock, Crown, Settings, CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import api from '../../constants/API/axiosInstance';
import { toast } from 'react-toastify';

const UserPermissionsPage = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedModules, setExpandedModules] = useState(new Set());

    useEffect(() => {
        fetchUserPermissions();
    }, []);

    const fetchUserPermissions = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get("/admin/admins/my-permissions");

            const userEmail = localStorage.getItem('userEmail') || 'Unknown';
            const userType = localStorage.getItem('userType');
            const userId = localStorage.getItem('userId');

            setUserInfo({
                email: userEmail,
                id: userId,
                userType: userType,
                createdAt: new Date().toISOString()
            });

            setPermissions(response.data || []);
        } catch (error) {
            console.error("Failed to fetch user permissions:", error);
            const message = error.response?.data?.message || "Failed to fetch user information";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const getRoleInfo = () => {
        const userType = userInfo?.userType || localStorage.getItem('userType');

        if (userType === 'SUPER_ADMIN') {
            return {
                type: 'SUPER_ADMIN',
                label: 'Super Administrator',
                color: 'red',
                icon: Crown
            };
        } else if (userType === 'ADMIN') {
            return {
                type: 'ADMIN',
                label: 'Administrator',
                color: 'blue',
                icon: Shield
            };
        } else {
            return {
                type: 'USER',
                label: 'User',
                color: 'gray',
                icon: User
            };
        }
    };

    const groupPermissionsByModule = (permissions) => {
        const modules = {};
        const standalone = [];

        permissions.forEach(permission => {
            if (permission.children && permission.children.length > 0) {
                // This is a module (parent permission)
                modules[permission.name] = permission;
            } else {
                // Check if this permission belongs to a module
                const belongsToModule = permissions.find(p =>
                    p.children && p.children.some(child => child.id === permission.id)
                );

                if (!belongsToModule) {
                    standalone.push(permission);
                }
            }
        });

        return { modules, standalone };
    };

    const toggleModule = (moduleName) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleName)) {
            newExpanded.delete(moduleName);
        } else {
            newExpanded.add(moduleName);
        }
        setExpandedModules(newExpanded);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your permissions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Permissions</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchUserPermissions}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const roleInfo = getRoleInfo();
    const RoleIcon = roleInfo.icon;
    const { modules, standalone } = groupPermissionsByModule(permissions);
    const isSuperAdmin = roleInfo.type === 'SUPER_ADMIN';

    const totalPermissions = Object.values(modules).reduce((total, module) =>
        total + (module.children?.length || 0), 0) + standalone.length;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Permissions</h1>
                            <p className="text-gray-600 mt-1">View your current role and access permissions</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                                <span className="text-lg font-semibold text-gray-700">
                                    {userInfo?.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{userInfo?.email}</p>
                                <p className="text-xs text-gray-500">ID: {userInfo?.id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role Information */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Information</h2>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${roleInfo.color === 'red' ? 'bg-red-100' :
                                roleInfo.color === 'blue' ? 'bg-blue-100' : 'bg-gray-100'
                                }`}>
                                <RoleIcon className={`w-6 h-6 ${roleInfo.color === 'red' ? 'text-red-600' :
                                    roleInfo.color === 'blue' ? 'text-blue-600' : 'text-gray-600'
                                    }`} />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{roleInfo.label}</h3>
                                <p className="text-gray-600">
                                    {isSuperAdmin ?
                                        'Full system access with all permissions' :
                                        `${totalPermissions} specific permission(s) granted across ${Object.keys(modules).length} module(s)`
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Current session</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Permissions */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Access Permissions</h2>
                        <p className="text-gray-600 mt-1">
                            {isSuperAdmin ?
                                'As a Super Administrator, you have unrestricted access to all system features.' :
                                'These are the specific permissions granted to your account organized by modules.'
                            }
                        </p>
                    </div>

                    <div className="p-6">
                        {isSuperAdmin ? (
                            <div className="text-center py-12">
                                <Crown className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Super Administrator Access</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    You have complete administrative access to all features and functions within the system.
                                    No permission restrictions apply to your account.
                                </p>
                            </div>
                        ) : totalPermissions === 0 ? (
                            <div className="text-center py-12">
                                <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Permissions Assigned</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    You currently have no specific permissions assigned to your account.
                                    Contact your system administrator for access to features.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Permission Modules */}
                                {Object.entries(modules).map(([moduleName, module]) => (
                                    <div key={module.id} className="border border-gray-200 rounded-lg">
                                        {/* Module Header */}
                                        <div className="p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                                            <button
                                                onClick={() => toggleModule(moduleName)}
                                                className="w-full flex items-center justify-between hover:bg-gray-100 -m-2 p-2 rounded transition-colors"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                                                        <Shield className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {moduleName}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {module.children?.length || 0} permissions
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                    {expandedModules.has(moduleName) ? (
                                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-gray-500" />
                                                    )}
                                                </div>
                                            </button>
                                        </div>

                                        {/* Module Permissions */}
                                        {expandedModules.has(moduleName) && (
                                            <div className="p-4">
                                                {module.description && (
                                                    <p className="text-sm text-gray-600 mb-4">
                                                        {module.description}
                                                    </p>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {module.children?.map((permission) => (
                                                        <div
                                                            key={permission.id}
                                                            className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                                                        >
                                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {permission.name}
                                                                </p>
                                                                {permission.description && (
                                                                    <p className="text-xs text-gray-600 mt-1">
                                                                        {permission.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Standalone Permissions */}
                                {standalone.length > 0 && (
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Individual Permissions
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {standalone.map((permission) => (
                                                <div
                                                    key={permission.id}
                                                    className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                                                >
                                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {permission.name}
                                                        </p>
                                                        {permission.description && (
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                {permission.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Security Notice */}
                {!isSuperAdmin && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-amber-800">Security Notice</h3>
                                <p className="text-sm text-amber-700 mt-1">
                                    Your access is restricted to the permissions listed above. If you need additional
                                    access to perform your duties, please contact your system administrator.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserPermissionsPage;