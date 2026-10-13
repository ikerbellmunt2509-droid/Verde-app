# Verde — tu dinero en calma

MVP de una web app de finanzas personales para jóvenes. Interfaz verde salvia, texto oscuro, movimientos, gastos pendientes, cálculo de dinero disponible, objetivo de ahorro y retos con puntos e insignias virtuales.

## Cómo probarla

### Opción rápida en un ordenador
1. Descomprime el ZIP.
2. Abre `index.html` en un navegador moderno.
3. Puedes probar las funciones principales. El modo instalable y el funcionamiento sin conexión requieren servir los archivos por HTTPS o localhost.

### Probar la instalación (gratis)
Una opción gratuita es publicar los archivos en GitHub Pages:
1. Crea una cuenta en GitHub.
2. Crea un repositorio público nuevo.
3. Sube todos los archivos de esta carpeta a la raíz del repositorio.
4. En Settings → Pages, activa la publicación desde la rama principal y carpeta `/root`.
5. Abre la URL que GitHub Pages te proporciona desde Chrome en Android y usa el menú ⋮ → “Añadir a pantalla de inicio” / “Instalar app”.

No compartas datos personales reales mientras pruebas la demo.

## Qué incluye
- Registro de ingresos y gastos, con categoría y fecha.
- Actualización automática del saldo al añadir movimientos.
- Gastos pendientes que se descuentan del dinero disponible; al marcarlos como pagados, se convierten en movimientos de gasto.
- Fecha de próximo cobro, ahorro reservado y meta mensual.
- Presupuesto diario orientativo.
- Retos y recompensas virtuales con puntos e insignias.
- Exportación JSON y borrado de datos.
- Manifest y service worker para instalación y caché básica.

## Privacidad y límites de esta versión
- Los datos se guardan en `localStorage` del navegador del dispositivo. No se envían a un servidor ni hay conexión bancaria.
- `localStorage` no está cifrado por esta app. Usa el bloqueo de pantalla de tu dispositivo y no guardes datos extremadamente sensibles. Exportar datos crea un archivo que debes guardar de forma segura.
- Borrar los datos del navegador puede eliminar tus registros. Exporta una copia de seguridad si quieres conservarlos.
- Esta versión es un prototipo funcional, no una aplicación financiera auditada. Antes de lanzarla al público conviene añadir pruebas, accesibilidad, copias de seguridad robustas, política de privacidad y revisión de seguridad.
- La fuente Manrope se carga desde Google Fonts cuando hay conexión; hay fuentes de sistema como alternativa.
