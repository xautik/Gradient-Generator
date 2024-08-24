document.addEventListener('DOMContentLoaded', () => {
    generateGradient(); // Generate gradient on initial load
});

// Toggle light/dark mode
function toggleMode() {
    document.body.classList.toggle('dark-mode');
}

// Add new color input
function addColorInput() {
    const colorInputs = document.getElementById('colorInputs');
    const formGroups = colorInputs.getElementsByClassName('form-group');
    
    // Prevent adding more than 10 color inputs
    if (formGroups.length >= 10) {
        showWarning('Maximum number of colors reached.');
        return;
    }

    const newColorInput = document.createElement('div');
    newColorInput.className = 'form-group';
    newColorInput.innerHTML = `
        <label>Color ${formGroups.length + 1}:</label>
        <input type="color" class="color-input" value="#ff0000">
        <select class="color-type">
            <option value="hex">Hex</option>
            <option value="rgb">RGB</option>
            <option value="hsl">HSL</option>
        </select>
        <button class="remove-color" onclick="removeColorInput(this)">Remove</button>
    `;

    colorInputs.appendChild(newColorInput);
}

// Remove a color input
function removeColorInput(button) {
    const formGroups = document.getElementById('colorInputs').getElementsByClassName('form-group');
    
    // Prevent removing the last 2 color inputs
    if (formGroups.length <= 2) {
        showWarning('At least 2 color inputs are required.');
        return;
    }

    button.parentElement.remove();
    generateGradient(); // Update gradient after removing color
}

// Generate gradient
function generateGradient() {
    const colorInputs = document.querySelectorAll('#colorInputs .form-group');
    const colors = Array.from(colorInputs).map(group => {
        const colorInput = group.querySelector('.color-input').value;
        const colorType = group.querySelector('.color-type').value;

        // Convert color based on selected type
        switch (colorType) {
            case 'rgb':
                return hexToRgb(colorInput);
            case 'hsl':
                return hexToHsl(colorInput);
            default:
                return colorInput;
        }
    });

    const gradientType = document.getElementById('gradientType').value;
    const angle = document.getElementById('gradientAngle').value || 45;

    let gradient;
    if (gradientType === 'linear') {
        gradient = `linear-gradient(${angle}deg, ${colors.join(', ')})`;
    } else if (gradientType === 'radial') {
        gradient = `radial-gradient(circle, ${colors.join(', ')})`;
    } else if (gradientType === 'conic') {
        gradient = `conic-gradient(from ${angle}deg, ${colors.join(', ')})`;
    }

    document.getElementById('gradientPreview').style.background = gradient;
    updateCodeOutput(gradient);
}

// Update CSS code output field
function updateCodeOutput(gradient) {
    const format = document.getElementById('colorFormat').value;
    let cssCode;

    if (format === 'hex') {
        cssCode = gradient;
    } else if (format === 'rgb') {
        cssCode = gradient.replace(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g, hexToRgb);
    } else if (format === 'rgba') {
        cssCode = gradient.replace(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g, hexToRgba);
    } else if (format === 'hsl') {
        cssCode = gradient.replace(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g, hexToHsl);
    } else if (format === 'hsla') {
        cssCode = gradient.replace(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g, hexToHsla);
    }

    const outputField = document.getElementById('codeOutput');
    outputField.textContent = cssCode;
}

// Copy CSS code to clipboard
function copyCode() {
    const codeOutput = document.getElementById('codeOutput').textContent;
    navigator.clipboard.writeText(codeOutput).then(() => {
        showWarning('Copied to clipboard!');
    }, () => {
        showWarning('Failed to copy!');
    });
}

// Show warning message in modal
function showWarning(message) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.textContent = message;
    document.body.appendChild(modal);

    // Display the modal and remove it after 2 seconds
    modal.style.display = 'block';
    setTimeout(() => {
        modal.style.display = 'none';
        modal.remove();
    }, 2000);
}

// Utility functions for color conversion
function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    // 3 digits
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    }
    // 6 digits
    else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgba(hex) {
    const rgb = hexToRgb(hex);
    return rgb.replace('rgb', 'rgba') + ', 1)';
}

function hexToHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function hexToHsla(hex) {
    const hsl = hexToHsl(hex);
    return hsl.replace('hsl', 'hsla') + ', 1)';
}

