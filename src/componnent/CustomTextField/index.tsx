import React from 'react';
import TextField from '@mui/material/TextField';
import { SxProps, Theme } from '@mui/material/styles';

interface CustomTextFieldProps {
    label: string;
    type?: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    color?: string;
    colorActive?: string;
    sx?: SxProps<Theme>;
    style?: React.CSSProperties;
    size?: 'small' | 'medium';
    variant?: 'outlined' | 'filled' | 'standard';
    autocomplete?: string;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
    label,
    type = 'text',
    value,
    onChange,
    color = '#000',
    colorActive = '#1976d2',
    sx = {},
    style = {},
    size = 'small',
    variant = 'outlined',
    autocomplete = 'off',
}) => {
    return (
        <TextField
            autoComplete={autocomplete}
            type={type}
            label={label}
            value={value}
            onChange={onChange}
            variant={variant}
            size={size}
            sx={{
                ...sx,
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: colorActive,
                    },
                    '&:hover fieldset': {
                        borderColor: colorActive,
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: colorActive,
                    },
                    color,
                },
                '& .MuiInputLabel-root': {
                    color,
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: colorActive,
                },
            }}
            style={{ marginLeft: '10px', ...style }}
        />
    );
};

export default CustomTextField;
