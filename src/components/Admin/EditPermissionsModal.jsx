import React, { useState, useEffect } from 'react';
import { X, Shield, Save, CheckCircle2, AlertCircle, User, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../constants/API/axiosInstance';

const EditPermissionsModal = ({ isOpen, onClose, admin, onSuccess }) => {
    const [permissions, setPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [expandedModules, setExpandedModules] = useState(new Set());
    
    useEffect(() => {
        if (isOpen && admin) {
            fetchPermissions();
        }
    }, [isOpen, admin]);

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/permissions/hierarchical');
            setPermissions(response.data || []);

            // Set currently selected permissions from admin data
            if (admin?.permissions) {
                const currentPermissions = extractAllPermissionNames(admin.permissions);
                setSelectedPermissions(currentPermissions);
            } else {
                setSelectedPermissions([]);
            }

            // Auto-expand modules that have children
            const modulesToExpand = new Set();
            (response.data || []).forEach(permission => {
                if (permission.children && permission.children.length > 0) {
                    modulesToExpand.add(permission.id);
                }
            });
            setExpandedModules(modulesToExpand);
        } catch (error) {
            setError('Failed to fetch permissions');
            toast.error('Failed to fetch permissions');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to extract all permission names from hierarchical structure
    const extractAllPermissionNames = (permissionObjects) => {
        const names = [];

        const extractNames = (perms) => {
            perms.forEach(perm => {
                names.push(perm.name);
                if (perm.children && perm.children.length > 0) {
                    extractNames(perm.children);
                }
            });
        };

        extractNames(permissionObjects);
        return names;
    };

    const handlePermissionToggle = (permissionName) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionName)
                ? prev.filter(p => p !== permissionName)
                : [...prev, permissionName]
        );
        setError(null);
    };

    const handleModuleToggle = (module) => {
        const moduleChildren = module.children?.map(child => child.name) || [];
        const allSelected = moduleChildren.every(childName =>
            selectedPermissions.includes(childName)
        );

        if (allSelected) {
            // Unselect all children and the module itself
            setSelectedPermissions(prev =>
                prev.filter(name => name !== module.name && !moduleChildren.includes(name))
            );
        } else {
            // Select all children and the module itself
            setSelectedPermissions(prev => {
                const newPermissions = new Set([...prev, module.name, ...moduleChildren]);
                return Array.from(newPermissions);
            });
        }
        setError(null);
    };

    // Handle individual child permission changes and parent module state
    const handleChildPermissionToggle = (childName, parentModule) => {
        const moduleChildren = parentModule.children?.map(child => child.name) || [];
        let newSelectedPermissions;

        if (selectedPermissions.includes(childName)) {
            // Removing child permission
            newSelectedPermissions = selectedPermissions.filter(p => p !== childName);

            // If no children are selected, remove the parent module
            const remainingChildrenSelected = moduleChildren.filter(child =>
                child !== childName && newSelectedPermissions.includes(child)
            );

            if (remainingChildrenSelected.length === 0) {
                newSelectedPermissions = newSelectedPermissions.filter(p => p !== parentModule.name);
            }
        } else {
            // Adding child permission
            newSelectedPermissions = [...selectedPermissions, childName];

            // Add parent module if not already selected
            if (!selectedPermissions.includes(parentModule.name)) {
                newSelectedPermissions.push(parentModule.name);
            }
        }

        setSelectedPermissions(newSelectedPermissions);
        setError(null);
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

    const handleSave = async () => {
        if (selectedPermissions.length === 0) {
            setError('At least one permission must be selected');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const response = await api.put(`/admin/admins/${admin.id}/permissions`, selectedPermissions);

            if (response.status === 200) {
                toast.success('Permissions updated successfully');
                onSuccess();
                onClose();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update permissions';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setError(null);
        onClose();
    };

    if (!isOpen || !admin) return null;

    // Separate modules (parents) from standalone permissions
    const modules = permissions.filter(p => p.children && p.children.length > 0);
    const standalonePermissions = permissions.filter(p =>
        (!p.children || p.children.length === 0) &&
        !permissions.some(parent => parent.children?.some(child => child.id === p.id))
    );

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl">
                            <Shield className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Edit Permissions</h2>
                            <div className="flex items-center space-x-2 mt-1">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{admin.email}</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {admin.role}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-600">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-700">
                                <strong>Current permissions:</strong> {selectedPermissions.length} selected
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                Select the permissions this administrator should have access to.
                                Module permissions control access to entire feature areas.
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-2 text-gray-600">Loading permissions...</span>
                            </div>
                        ) : (
                            <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
                                {/* Permission Modules */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {modules.map((module) => {
                                        const moduleChildren = module.children || [];
                                        const selectedChildren = moduleChildren.filter(child =>
                                            selectedPermissions.includes(child.name)
                                        );
                                        const isModuleSelected = selectedPermissions.includes(module.name);
                                        const allChildrenSelected = moduleChildren.length > 0 &&
                                            selectedChildren.length === moduleChildren.length;
                                        const partiallySelected = selectedChildren.length > 0 &&
                                            selectedChildren.length < moduleChildren.length;

                                        return (
                                            <div key={module.id} className={`bg-white rounded-lg border transition-colors ${isModuleSelected ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                                                }`}>
                                                <div
                                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                                    onClick={() => toggleModuleExpansion(module.id)}
                                                >
                                                    <div className="flex items-center space-x-3 flex-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={isModuleSelected && allChildrenSelected}
                                                            ref={input => {
                                                                if (input) input.indeterminate = partiallySelected;
                                                            }}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                handleModuleToggle(module);
                                                            }}
                                                            className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <div className="flex items-center space-x-2">
                                                            <Shield className={`w-5 h-5 ${isModuleSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                                                            <div>
                                                                <span className={`text-sm font-semibold ${isModuleSelected ? 'text-purple-800' : 'text-gray-800'
                                                                    }`}>
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
                                                                    checked={selectedPermissions.includes(child.name)}
                                                                    onChange={() => handleChildPermissionToggle(child.name, module)}
                                                                    className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className="text-sm font-medium text-gray-700">
                                                                            {child.name}
                                                                        </span>
                                                                        {selectedPermissions.includes(child.name) && (
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
                                                        checked={selectedPermissions.includes(permission.name)}
                                                        onChange={() => handlePermissionToggle(permission.name)}
                                                        className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {permission.name}
                                                            </span>
                                                            {selectedPermissions.includes(permission.name) && (
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

                        {/* Permission Summary */}
                        <div className="flex items-center justify-between text-sm p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Shield className="w-4 h-4 text-purple-600" />
                                <span className="text-gray-700">Total permissions selected:</span>
                            </div>
                            <span className="font-semibold text-purple-800">
                                {selectedPermissions.length}
                            </span>
                        </div>

                        {/* Debug info - remove in production */}
                        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                            <strong>Selected permissions:</strong> {selectedPermissions.join(', ')}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 p-6 border-t bg-gray-50">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || selectedPermissions.length === 0}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPermissionsModal;