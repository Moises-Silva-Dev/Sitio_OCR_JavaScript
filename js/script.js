// Espera a que todo el contenido del HTML esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {
    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const imagePreview = document.getElementById('image-preview');
    const extractedText = document.getElementById('extracted-text');
    const uploadBtn = document.getElementById('upload-btn');
    const extractBtn = document.getElementById('extract-btn');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-btn');

    let imagenActual = null; // Variable para guardar el archivo de imagen seleccionado
    const placeholderHTML = `<i class="fa-regular fa-image fa-3x"></i><p>Arrastra una imagen o haz clic para seleccionarla</p>`;

    // Crear un input de tipo 'file' oculto para manejar la carga de archivos
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    // Esta función se usará para click, arrastrar y pegar.
    function handleFile(file) {
        if (file && file.type.startsWith('image/')) {
            imagenActual = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                // Muestra la imagen en la zona de previsualización
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Imagen Previsualizada">`;
                imagePreview.style.borderColor = 'var(--border-color)'; // Restaura el borde
            };
            reader.readAsDataURL(file);
        } else {
            alert('Por favor, selecciona un archivo de imagen válido.');
        }
    }

    // --- LÓGICA PARA CARGAR IMAGEN (HACIENDO CLIC) ---
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        handleFile(file);
    });

    uploadBtn.addEventListener('click', () => fileInput.click());
    imagePreview.addEventListener('click', () => fileInput.click());
    
    // --- NUEVO: LÓGICA PARA ARRASTRAR Y SOLTAR (DRAG & DROP) ---
    imagePreview.addEventListener('dragover', (event) => {
        event.preventDefault(); // ¡Muy importante! Previene el comportamiento por defecto.
        imagePreview.style.borderColor = 'var(--accent-color)'; // Feedback visual
    });

    imagePreview.addEventListener('dragleave', () => {
        imagePreview.style.borderColor = 'var(--border-color)'; // Restaura el borde
    });

    imagePreview.addEventListener('drop', (event) => {
        event.preventDefault(); // Previene que el navegador abra la imagen.
        const file = event.dataTransfer.files[0];
        handleFile(file);
    });

    // --- NUEVO: LÓGICA PARA PEGAR (CTRL + V) ---
    document.addEventListener('paste', (event) => {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                handleFile(file);
                break; // Detenemos el bucle una vez que encontramos una imagen
            }
        }
    });

    // --- FUNCIÓN PARA EXTRAER TEXTO (Sin cambios) ---
    extractBtn.addEventListener('click', () => {
        if (!imagenActual) {
            alert('Por favor, carga una imagen primero.');
            return;
        }

        extractedText.placeholder = 'Extrayendo texto, por favor espera...';
        extractedText.value = '';

        Tesseract.recognize(imagenActual, 'spa', { 
            logger: m => console.log(m) })
        .then(({ data: { text } }) => {
            extractedText.value = text.trim() || "No se pudo detectar texto en la imagen.";
        }).catch((err) => {
            extractedText.value = "Error al extraer texto: " + err.message;
            console.error(err);
        }).finally(() => {
            extractedText.placeholder = 'El texto extraído aparecerá aquí...';
        });
    });

    // --- FUNCIÓN PARA COPIAR TEXTO ---
    copyBtn.addEventListener('click', () => {
        const texto = extractedText.value;
        if (!texto) {
            alert('No hay texto para copiar.');
            return;
        }
        navigator.clipboard.writeText(texto).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> ¡Copiado!`;
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            alert('Error al copiar el texto.');
            console.error('Error al copiar:', err);
        });
    });

    // --- FUNCIÓN PARA LIMPIAR LA INTERFAZ ---
    clearBtn.addEventListener('click', () => {
        imagenActual = null;
        imagePreview.innerHTML = placeholderHTML;
        extractedText.value = '';
        fileInput.value = '';
        imagePreview.style.borderColor = 'var(--border-color)';
    });

    // --- FUNCIÓN PARA DESCARGAR EL TEXTO ---
    downloadBtn.addEventListener('click', () => {
        const texto = extractedText.value;
        if (!texto) {
            alert('No hay texto para descargar.');
            return;
        }
        const blob = new Blob([texto], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'texto-extraido.doc';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

});