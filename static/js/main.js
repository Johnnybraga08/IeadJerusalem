// Main JavaScript file for IEAD Jerusalem T-shirt Management System

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Initialize data tables
    initializeDataTables();
    
    // Initialize auto-save functionality
    initializeAutoSave();
    
    // Initialize keyboard shortcuts
    initializeKeyboardShorts();
    
    // Initialize theme preferences
    initializeTheme();
    
    console.log('IEAD Jerusalem T-shirt Management System initialized successfully');
}

// Initialize Bootstrap Tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Form Validation Enhancement
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.prototype.slice.call(forms).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                
                // Focus on first invalid field
                const firstInvalidField = form.querySelector(':invalid');
                if (firstInvalidField) {
                    firstInvalidField.focus();
                    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            
            form.classList.add('was-validated');
        }, false);
    });
    
    // Real-time validation
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
        });
    });
}

// Validate Individual Field
function validateField(field) {
    const isValid = field.checkValidity();
    
    field.classList.remove('is-valid', 'is-invalid');
    field.classList.add(isValid ? 'is-valid' : 'is-invalid');
    
    // Custom validation messages
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback && !isValid) {
        feedback.textContent = getCustomValidationMessage(field);
    }
}

// Custom Validation Messages
function getCustomValidationMessage(field) {
    const validity = field.validity;
    const fieldName = field.getAttribute('data-field-name') || field.name || 'Este campo';
    
    if (validity.valueMissing) {
        return `${fieldName} é obrigatório.`;
    }
    if (validity.typeMismatch) {
        if (field.type === 'email') {
            return 'Por favor, digite um email válido.';
        }
        if (field.type === 'tel') {
            return 'Por favor, digite um telefone válido.';
        }
    }
    if (validity.patternMismatch) {
        return `${fieldName} não está no formato correto.`;
    }
    if (validity.rangeUnderflow) {
        return `${fieldName} deve ser maior que ${field.min}.`;
    }
    if (validity.rangeOverflow) {
        return `${fieldName} deve ser menor que ${field.max}.`;
    }
    if (validity.tooShort) {
        return `${fieldName} deve ter pelo menos ${field.minLength} caracteres.`;
    }
    if (validity.tooLong) {
        return `${fieldName} deve ter no máximo ${field.maxLength} caracteres.`;
    }
    
    return 'Por favor, verifique o valor inserido.';
}

// Initialize Enhanced Data Tables
function initializeDataTables() {
    const tables = document.querySelectorAll('.data-table');
    
    tables.forEach(table => {
        // Add search functionality
        addTableSearch(table);
        
        // Add sorting functionality
        addTableSorting(table);
        
        // Add row selection
        addRowSelection(table);
    });
}

// Add Table Search
function addTableSearch(table) {
    const searchInput = table.parentNode.querySelector('.table-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
        
        updateTableStats(table);
    });
}

// Add Table Sorting
function addTableSorting(table) {
    const headers = table.querySelectorAll('th[data-sortable]');
    
    headers.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            sortTable(table, this);
        });
        
        // Add sort indicator
        const indicator = document.createElement('i');
        indicator.className = 'fas fa-sort ms-2';
        header.appendChild(indicator);
    });
}

// Sort Table
function sortTable(table, header) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const columnIndex = Array.from(header.parentNode.children).indexOf(header);
    const currentSort = header.getAttribute('data-sort') || 'none';
    
    // Reset all sort indicators
    table.querySelectorAll('th i').forEach(i => {
        i.className = 'fas fa-sort ms-2';
    });
    
    let newSort;
    if (currentSort === 'none' || currentSort === 'desc') {
        newSort = 'asc';
        header.querySelector('i').className = 'fas fa-sort-up ms-2';
    } else {
        newSort = 'desc';
        header.querySelector('i').className = 'fas fa-sort-down ms-2';
    }
    
    header.setAttribute('data-sort', newSort);
    
    rows.sort((a, b) => {
        const aVal = a.children[columnIndex].textContent.trim();
        const bVal = b.children[columnIndex].textContent.trim();
        
        // Check if numeric
        const aNum = parseFloat(aVal.replace(/[^\d.-]/g, ''));
        const bNum = parseFloat(bVal.replace(/[^\d.-]/g, ''));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return newSort === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // String comparison
        if (newSort === 'asc') {
            return aVal.localeCompare(bVal, 'pt-BR');
        } else {
            return bVal.localeCompare(aVal, 'pt-BR');
        }
    });
    
    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
}

// Add Row Selection
function addRowSelection(table) {
    const selectAllCheckbox = table.querySelector('th input[type="checkbox"]');
    const rowCheckboxes = table.querySelectorAll('td input[type="checkbox"]');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
                updateRowSelection(checkbox.closest('tr'), this.checked);
            });
            updateBulkActions();
        });
    }
    
    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateRowSelection(this.closest('tr'), this.checked);
            updateSelectAllState(table);
            updateBulkActions();
        });
    });
}

// Update Row Selection
function updateRowSelection(row, selected) {
    if (selected) {
        row.classList.add('table-active');
    } else {
        row.classList.remove('table-active');
    }
}

// Update Select All State
function updateSelectAllState(table) {
    const selectAllCheckbox = table.querySelector('th input[type="checkbox"]');
    const rowCheckboxes = table.querySelectorAll('td input[type="checkbox"]');
    
    if (selectAllCheckbox && rowCheckboxes.length > 0) {
        const checkedCount = Array.from(rowCheckboxes).filter(cb => cb.checked).length;
        
        selectAllCheckbox.checked = checkedCount === rowCheckboxes.length;
        selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < rowCheckboxes.length;
    }
}

// Update Bulk Actions
function updateBulkActions() {
    const selectedRows = document.querySelectorAll('td input[type="checkbox"]:checked');
    const bulkActions = document.querySelector('.bulk-actions');
    
    if (bulkActions) {
        bulkActions.style.display = selectedRows.length > 0 ? 'block' : 'none';
        
        const countSpan = bulkActions.querySelector('.selected-count');
        if (countSpan) {
            countSpan.textContent = selectedRows.length;
        }
    }
}

// Auto-save Functionality
function initializeAutoSave() {
    const forms = document.querySelectorAll('[data-auto-save]');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        let saveTimeout;
        
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                clearTimeout(saveTimeout);
                showAutoSaveIndicator('saving');
                
                saveTimeout = setTimeout(() => {
                    autoSaveForm(form);
                }, 2000); // Save after 2 seconds of inactivity
            });
        });
    });
}

// Auto Save Form
function autoSaveForm(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Save to localStorage
    const formId = form.id || 'auto-save-form';
    localStorage.setItem(`autosave_${formId}`, JSON.stringify(data));
    
    showAutoSaveIndicator('saved');
}

// Show Auto-save Indicator
function showAutoSaveIndicator(status) {
    let indicator = document.querySelector('.auto-save-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'auto-save-indicator position-fixed bottom-0 end-0 m-3 p-2 rounded bg-info text-white';
        indicator.style.zIndex = '9999';
        document.body.appendChild(indicator);
    }
    
    if (status === 'saving') {
        indicator.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Salvando...';
        indicator.className = indicator.className.replace(/bg-\w+/, 'bg-info');
    } else if (status === 'saved') {
        indicator.innerHTML = '<i class="fas fa-check me-2"></i>Salvo automaticamente';
        indicator.className = indicator.className.replace(/bg-\w+/, 'bg-success');
        
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 3000);
    }
    
    indicator.style.display = 'block';
}

// Keyboard Shortcuts
function initializeKeyboardShorts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+S to save form
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            const activeForm = document.querySelector('form:focus-within');
            if (activeForm) {
                const submitBtn = activeForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.click();
                }
            }
        }
        
        // Ctrl+N for new order
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            const newOrderLink = document.querySelector('a[href*="new_order"]');
            if (newOrderLink) {
                window.location.href = newOrderLink.href;
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                const modal = bootstrap.Modal.getInstance(openModal);
                if (modal) {
                    modal.hide();
                }
            }
        }
    });
}

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    applyTheme(savedTheme);
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'auto';
            const newTheme = currentTheme === 'dark' ? 'light' : currentTheme === 'light' ? 'auto' : 'dark';
            
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// Apply Theme
function applyTheme(theme) {
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

// Utility Functions

// Format Currency
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Format Date
function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    
    return new Intl.DateTimeFormat('pt-BR', { ...defaultOptions, ...options }).format(new Date(date));
}

// Show Toast Notification
function showToast(message, type = 'info', duration = 5000) {
    const toastContainer = getOrCreateToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-${getToastIcon(type)} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, { delay: duration });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

// Get or Create Toast Container
function getOrCreateToastContainer() {
    let container = document.querySelector('.toast-container');
    
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    return container;
}

// Get Toast Icon
function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    return icons[type] || 'info-circle';
}

// Confirm Dialog
function confirmDialog(message, callback) {
    const result = confirm(message);
    if (result && typeof callback === 'function') {
        callback();
    }
    return result;
}

// Loading Overlay
function showLoading(message = 'Carregando...') {
    let overlay = document.querySelector('.loading-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'loading-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '9999';
        overlay.innerHTML = `
            <div class="bg-white p-4 rounded text-center">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div>${message}</div>
            </div>
        `;
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = 'flex';
        overlay.querySelector('div:last-child').textContent = message;
    }
}

// Hide Loading
function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Export functions for global use
window.ChurchSystem = {
    formatCurrency,
    formatDate,
    showToast,
    confirmDialog,
    showLoading,
    hideLoading,
    validateField
};

// Service Worker Registration (for offline functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Analytics and Error Tracking
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    
    // Send error to logging service if available
    if (window.errorLogger) {
        window.errorLogger.log({
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            error: e.error
        });
    }
});

// Performance Monitoring
window.addEventListener('load', function() {
    if (window.performance && window.performance.timing) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log('Page load time:', loadTime + 'ms');
        
        // Send performance data if analytics available
        if (window.analytics) {
            window.analytics.track('page_load_time', { duration: loadTime });
        }
    }
});
