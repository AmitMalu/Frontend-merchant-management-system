// PageHeader.jsx
import React from 'react';

const PageHeader = ({
    icon: Icon,
    iconColor = "text-blue-600",
    title,
    description,
    buttonText,
    buttonIcon: ButtonIcon,
    onButtonClick,
    buttonColor = "bg-blue-600 hover:bg-blue-700"
}) => {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {Icon && <Icon className={iconColor} />}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        {description && <p className="text-gray-600">{description}</p>}
                    </div>
                </div>
                {buttonText && onButtonClick && (
                    <button
                        onClick={onButtonClick}
                        className={`flex items-center space-x-2 ${buttonColor} text-white px-4 py-2 rounded-lg transition-colors`}
                    >
                        {ButtonIcon && <ButtonIcon className="h-5 w-5" />}
                        <span>{buttonText}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default PageHeader;