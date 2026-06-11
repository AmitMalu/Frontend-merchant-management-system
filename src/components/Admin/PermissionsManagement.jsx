import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Shield, AlertTriangle, CheckCircle, X, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../constants/API/axiosInstance';

const PermissionsManagement = () => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingPermission, setEditingPermission] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parentId: null
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [expandedModules, setExpandedModules] = useState(new Set());

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const response = await api.get("/admin/permissions/hierarchical");
            setPermissions(response.data || []);
        } catch (error) {
            console.error("Failed to fetch permissions:", error);
            toast.error("Failed to load permissions");
        } finally {
            setLoading(false);
        }
    };

    // Filter to get only parent permissions (modules)
    const parentPermissions = permissions;

    // Filter permissions based on search
    const filteredPermissions = permissions.filter(permission =>
        permission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Permission name is required';
        } else if (permissions.some(p => p.name === formData.name && p.id !== editingPermission?.id)) {
            newErrors.name = 'Permission name already exists';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEdit = (permission , parentId) => {
        setEditingPermission(permission);
        setFormData({
            name: permission.name,
            description: permission.description || '',
            parentId: parentId || null
        });
        setShowCreateForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSaving(true);
        try {
            const payload = {
                name: formData.name,
                description: formData.description
            };

            // Add parent_id if creating a child permission
            if (formData.parentId) {
                payload.parent_id = formData.parentId;
            }

            const url = editingPermission
                ? `/admin/permissions/${editingPermission.id}`
                : "/admin/permissions";

            const method = editingPermission ? "put" : "post";
            const response = await api[method](url, payload);

            // Refresh permissions list
            await fetchPermissions();

            toast.success(editingPermission ? "Permission updated successfully" : "Permission created successfully");
            resetForm();
        } catch (error) {
            const message = error.response?.data?.message || "Failed to save permission";
            setErrors({ submit: message });
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (permission) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete permission "${permission.name}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await api.delete(`/admin/permissions/${permission.id}`);
            await fetchPermissions(); // Refresh list
            toast.success(`Permission "${permission.name}" deleted successfully`);
        } catch (error) {
            const message = error.response?.data?.message || "Failed to delete permission";
            toast.error(message);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', parentId: null });
        setEditingPermission(null);
        setShowCreateForm(false);
        setErrors({});
    };

    const toggleModule = (moduleId) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const predefinedModules = [
        {
            name: 'Vendors',
            description: 'Manage vendors, add products, vendor rates',
            children: [
                { name: 'Vendor List', description: 'View and manage vendor list' },
                { name: 'Vendor Rates', description: 'Manage vendor pricing rates' },
                { name: 'Product List', description: 'View vendor products' }
            ]
        },
        {
            name: 'Inventory',
            description: 'Price scheme of products, inventory management - inward/outward/return',
            children: [
                { name: 'Pricing Scheme', description: 'Manage product pricing schemes' },
                { name: 'Product Scheme Assign', description: 'Assign schemes to products' },
                { name: 'Inventory', description: 'Manage inventory operations' }
            ]
        },
        {
            name: 'Customers',
            description: 'Customer onboarding, approval, distribution',
            children: [
                { name: 'Customer List', description: 'View customer list' },
                { name: 'Onboard Customer', description: 'Add new customers' },
                { name: 'Merchant Approval', description: 'Approve merchant applications' },
                { name: 'Products Distribution', description: 'Manage product distribution' }
            ]
        },
        {
            name: 'Other',
            description: 'Miscellaneous operations',
            children: [
                { name: 'File Upload', description: 'Upload files' },
                { name: 'Charge Calculation', description: 'Calculate charges' },
                { name: 'Batch Status', description: 'View batch status' }
            ]
        },
        {
            name: 'Reports',
            description: 'Fetch and export reports',
            children: [
                { name: 'Franchise Reports', description: 'Generate franchise reports' }
            ]
        }
    ];

    const addPredefinedModule = async (module) => {
        try {
            // First create parent permission
            const parentResponse = await api.post("/admin/permissions", {
                name: module.name,
                description: module.description
            });

            const parentId = parentResponse.data.id;

            // Then create child permissions
            for (const child of module.children) {
                await api.post("/admin/permissions", {
                    name: child.name,
                    description: child.description,
                    parent_id: parentId
                });
            }

            await fetchPermissions(); // Refresh list
            toast.success(`Module "${module.name}" with ${module.children.length} permissions added successfully`);
        } catch (error) {
            console.error("Failed to add predefined module:", error);
            const message = error.response?.data?.message || "Failed to add module";
            toast.error(message);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading permissions...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Permissions Management</h1>
                <p className="text-gray-600 mt-1">Create and manage system permissions and modules</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Search permissions..."
                    />
                </div>

                <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Permission</span>
                </button>
            </div>

            {/* Quick Setup */}
            {parentPermissions.length === 0 && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-blue-800">Quick Setup</h3>
                            <p className="text-sm text-blue-700 mt-1 mb-3">
                                Add predefined permission modules to get started quickly:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {predefinedModules.map((module) => (
                                    <button
                                        key={module.name}
                                        onClick={() => addPredefinedModule(module)}
                                        className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                                    >
                                        {module.name} ({module.children.length})
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Form Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingPermission ? 'Edit Permission' : 'Create New Permission'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {errors.submit && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {errors.submit}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Permission Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                    placeholder="e.g., Vendors, Vendor List"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe what this permission allows..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Parent Module (Optional)
                                </label>
                                <select
                                    name="parentId"
                                    value={formData.parentId || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        parentId: e.target.value ? parseInt(e.target.value) : null
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Create as Module (No Parent)</option>
                                    {parentPermissions.map((parent) => (
                                        <option key={parent.id} value={parent.id}>
                                            {parent.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Leave empty to create a new module, or select a parent to create a sub-permission
                                </p>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            {editingPermission ? 'Update' : 'Create'}
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Permissions List */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Permission Modules ({parentPermissions.length})
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Hierarchical permission structure with modules and sub-permissions
                    </p>
                </div>

                <div className="divide-y divide-gray-200">
                    {parentPermissions.length === 0 ? (
                        <div className="p-6 text-center">
                            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No permission modules created</h3>
                            <p className="text-gray-600 mb-4">Create your first permission module to get started</p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create Module
                            </button>
                        </div>
                    ) : (
                        parentPermissions.map((module) => (
                            <div key={module.id} className="p-6">
                                {/* Module Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => toggleModule(module.id)}
                                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                                        >
                                            {expandedModules.has(module.id) ? (
                                                <ChevronDown className="w-4 h-4 text-gray-500" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-gray-500" />
                                            )}
                                        </button>
                                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                                            <Shield className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                {module.name}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {module.children?.length || 0} sub-permissions
                                            </p>
                                            {module.description && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {module.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEdit(module)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(module)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Sub-permissions */}
                                {expandedModules.has(module.id) && (
                                    <div className="ml-8 space-y-2">
                                        {module.children?.map((child) => (
                                            <div key={child.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {child.name}
                                                        </p>
                                                        {child.description && (
                                                            <p className="text-xs text-gray-500">
                                                                {child.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <button
                                                        onClick={() => handleEdit(child,module?.id)}
                                                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    >
                                                        <Edit3 className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(child)}
                                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default PermissionsManagement;