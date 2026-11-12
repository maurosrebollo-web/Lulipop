document.addEventListener('DOMContentLoaded', () => {

    // 1. CONFIGURACIÓN GENERAL POR DEFECTO
    const configDefault = {
        diasAnticipacion: 4,
        tarifasEnvio: "Envíos dentro de la ciudad desde $150 (el costo exacto se confirma por WhatsApp según dirección).",
        aboutTitle: "Sobre Lulipop",
        aboutText: "¡Hola! Bienvenidos a Lulipop. Detrás de cada torta, muffin y cookie hay dedicación, ingredientes seleccionados y mucho amor por los detalles. Trabajamos por encargo para asegurarnos de que cada creación sea única y fresca para tu evento especial.",
        aboutImg: "Lulipop logo.PNG",
        logoImg: "Lulipop logo.PNG"
    };

    let config = JSON.parse(localStorage.getItem('lulipop_config')) || configDefault;

    const logoEl = document.getElementById('img-site-logo');
    if (logoEl && config.logoImg) logoEl.src = config.logoImg;

    if (document.getElementById('about-title')) {
        document.getElementById('about-title').textContent = config.aboutTitle;
        document.getElementById('about-text').textContent = config.aboutText;
        document.getElementById('about-img').src = config.aboutImg;
    }

    // 2. MENÚ LATERAL DERECHO ADMINISTRABLE (Con el icono correcto de muffins)
    const menuDefault = [
        { texto: "Inicio", url: "index.html", icono: "fa-solid fa-house" },
        { texto: "Tortas", url: "tortas.html", icono: "fa-solid fa-cake-candles" },
        { texto: "Muffins", url: "muffins.html", icono: "fa-solid fa-bread-slice" },
        { texto: "Cookies", url: "cookies.html", icono: "fa-solid fa-cookie-bite" },
        { texto: "Galería", url: "index.html#galeria", icono: "fa-solid fa-images" },
        { texto: "Procesos", url: "index.html#blog", icono: "fa-solid fa-video" },
        { texto: "FAQ", url: "index.html#faq", icono: "fa-solid fa-circle-question" },
        { texto: "Admin", url: "admin.html", icono: "fa-solid fa-lock" }
    ];

    let menuItems = JSON.parse(localStorage.getItem('lulipop_menu'));
    if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
        menuItems = menuDefault;
        localStorage.setItem('lulipop_menu', JSON.stringify(menuItems));
    }

    const sidebarNav = document.getElementById('sidebar-menu');
    if (sidebarNav) {
        sidebarNav.innerHTML = '';
        menuItems.forEach(item => {
            sidebarNav.innerHTML += `<a href="${item.url}" title="${item.texto}"><i class="${item.icono}"></i><span>${item.texto}</span></a>`;
        });
    }

    // 3. CATÁLOGO DE PRODUCTOS
    let productos = JSON.parse(localStorage.getItem('lulipop_catalogo')) || [];

    function renderizarCategoria(catName, containerId) {
        const cont = document.getElementById(containerId);
        const selectProd = document.getElementById('select-producto');
        let filtrados = productos.filter(p => p.categoria === catName);

        if (cont) {
            if (filtrados.length === 0) {
                cont.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#666;">Aún no hay modelos cargados en esta sección. ¡Puedes encargarnos tu diseño personalizado en el formulario de abajo!</p>`;
            } else {
                cont.innerHTML = '';
                filtrados.forEach(p => {
                    cont.innerHTML += `
                        <div class="card">
                            <img src="${p.imagen}" alt="${p.nombre}">
                            <div class="card-body">
                                <h3>${p.nombre}</h3>
                                <p>${p.desc}</p>
                                <div class="card-footer">
                                    <span class="price">${p.precio}</span>
                                </div>
                            </div>
                        </div>`;
                });
            }
        }

        if (selectProd && document.getElementById('form-reserva')?.dataset.categoria.toLowerCase().includes(catName)) {
            selectProd.innerHTML = `<option value="Diseño Personalizado (Ver foto/detalles)">Diseño Personalizado (Según mi idea)</option>`;
            filtrados.forEach(p => {
                selectProd.innerHTML += `<option value="${p.nombre}">${p.nombre} (${p.precio})</option>`;
            });
        }
    }

    renderizarCategoria('torta', 'contenedor-tortas');
    renderizarCategoria('muffin', 'contenedor-muffins');
    renderizarCategoria('cookie', 'contenedor-cookies');

    // 4. OPCIONES DESPLEGABLES CONFIGURABLES
    const opcionesDefault = {
        pesosTortas: ["1.5 Kg - Chica (12 a 15 porciones)", "2.5 Kg - Mediana (20 a 25 porciones)", "3.5 Kg - Grande (30 a 35 porciones)"],
        bizcochuelos: ["Vainilla", "Chocolate", "Marmolado", "Red Velvet", "Limón"],
        rellenos: ["Dulce de leche", "Dulce de leche con chispas", "Crema Bariloche", "Ganache de Chocolate", "Frutos Rojos"],
        cantidadesPack: ["Caja x 6 unidades", "Caja x 12 unidades", "Caja x 24 unidades"],
        saboresPack: ["Vainilla", "Chocolate", "Surtidos (Vainilla y Chocolate)", "Limón / Naranja"]
    };

    let opciones = JSON.parse(localStorage.getItem('lulipop_opciones')) || opcionesDefault;

    function llenarSelect(id, lista) {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = '';
        lista.forEach(op => el.innerHTML += `<option value="${op}">${op}</option>`);
    }

    llenarSelect('select-peso-torta', opciones.pesosTortas);
    llenarSelect('select-bizcochuelo', opciones.bizcochuelos);
    llenarSelect('select-relleno', opciones.rellenos);
    llenarSelect('select-cantidad-pack', opciones.cantidadesPack);
    llenarSelect('select-sabor-pack', opciones.saboresPack);

    // 5. BLOQUEO DE FECHAS MÍNIMAS Y TARIFAS DE ENVÍO
    const inputFecha = document.getElementById('reserva-fecha');
    const txtAnticipacion = document.getElementById('texto-anticipacion');
    const txtTarifas = document.getElementById('texto-tarifas-envio');

    if (inputFecha) {
        const diasMin = parseInt(config.diasAnticipacion) || 3;
        const hoy = new Date();
        hoy.setDate(hoy.getDate() + diasMin);
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        inputFecha.min = `${yyyy}-${mm}-${dd}`;

        if (txtAnticipacion) {
            txtAnticipacion.textContent = `* Requiere al menos ${diasMin} días de anticipación.`;
        }
    }

    if (txtTarifas && config.tarifasEnvio) {
        txtTarifas.textContent = config.tarifasEnvio;
    }

    // 6. PROCESAMIENTO DEL FORMULARIO DE RESERVA
    const formReserva = document.getElementById('form-reserva');
    if (formReserva) {
        formReserva.addEventListener('submit', (e) => {
            e.preventDefault();

            const categoria = formReserva.dataset.categoria;
            const producto = document.getElementById('select-producto').value;
            const fecha = document.getElementById('reserva-fecha').value;
            const entrega = document.getElementById('reserva-entrega').value;
            const nombre = document.getElementById('reserva-nombre').value;
            const telefono = document.getElementById('reserva-telefono').value;

            let detallesExtra = "";
            if (categoria === "Torta") {
                const peso = document.getElementById('select-peso-torta').value;
                const bizc = document.getElementById('select-bizcochuelo').value;
                const rell = document.getElementById('select-relleno').value;
                detallesExtra = `Peso/Tamaño: ${peso} | Bizcochuelo: ${bizc} | Relleno: ${rell}`;
            } else {
                const cant = document.getElementById('select-cantidad-pack').value;
                const sab = document.getElementById('select-sabor-pack').value;
                detallesExtra = `Cantidad: ${cant} | Sabor: ${sab}`;
            }

            let alergiasChecks = [];
            document.querySelectorAll('.check-alergia:checked').forEach(chk => alergiasChecks.push(chk.value));
            const alergiaDetalle = document.getElementById('reserva-alergia-detalle').value.trim();
            let textoAlergias = alergiasChecks.length > 0 ? alergiasChecks.join(', ') : "Ninguna marcada";
            if (alergiaDetalle) textoAlergias += ` (${alergiaDetalle})`;

            const fileInput = document.getElementById('reserva-foto-ref');
            const file = fileInput.files[0];

            function finalizarReserva(fotoBase64) {
                const nuevaReserva = {
                    id: Date.now(),
                    fechaSolicitud: new Date().toLocaleDateString(),
                    categoria,
                    producto,
                    detallesExtra,
                    fechaEvento: fecha,
                    entrega,
                    alergias: textoAlergias,
                    nombre,
                    telefono,
                    fotoRef: fotoBase64 || "",
                    estado: "Pendiente de confirmación"
                };

                let reservas = JSON.parse(localStorage.getItem('lulipop_reservas')) || [];
                reservas.unshift(nuevaReserva);
                localStorage.setItem('lulipop_reservas', JSON.stringify(reservas));

                let msg = `¡Hola Lulipop! Quisiera consultar disponibilidad para reservar:\n\n`;
                msg += `*Categoría:* ${categoria}\n`;
                msg += `*Modelo:* ${producto}\n`;
                msg += `*Detalles:* ${detallesExtra}\n`;
                msg += `*Fecha del evento:* ${fecha}\n`;
                msg += `*Entrega:* ${entrega}\n`;
                msg += `*Alergias/Intolerancias:* ${textoAlergias}\n`;
                msg += `*Cliente:* ${nombre} (${telefono})\n`;
                if (fotoBase64) msg += `*(Adjunto imagen de referencia en la web / te la envío por aquí)*\n`;

                alert("¡Solicitud registrada con éxito! Ahora te redirigiremos a WhatsApp para enviarnos el resumen y confirmar disponibilidad.");
                formReserva.reset();

                const urlWa = `https://wa.me/59898101555?text=${encodeURIComponent(msg)}`;
                window.open(urlWa, '_blank');
            }

            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        const maxW = 500;
                        const scale = maxW / img.width;
                        canvas.width = img.width > maxW ? maxW : img.width;
                        canvas.height = img.width > maxW ? img.height * scale : img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        finalizarReserva(canvas.toDataURL('image/jpeg', 0.65));
                    };
                    img.src = ev.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                finalizarReserva(null);
            }
        });
    }

    // 7. GALERÍA
    const contGaleria = document.getElementById('contenedor-galeria');
    if (contGaleria) {
        let galeria = JSON.parse(localStorage.getItem('lulipop_galeria')) || [];
        if (galeria.length === 0) {
            contGaleria.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#666;">Pronto subiremos fotos de nuestros últimos trabajos realizados.</p>`;
        } else {
            contGaleria.innerHTML = '';
            galeria.forEach(g => {
                contGaleria.innerHTML += `
                    <div class="card">
                        <img src="${g.imagen}" alt="${g.titulo}">
                        <div class="card-body">
                            <h3>${g.titulo}</h3>
                            <p>${g.desc}</p>
                        </div>
                    </div>`;
            });
        }
    }

    // 8. BLOG DE PROCESOS
    const contBlog = document.getElementById('contenedor-blog');
    if (contBlog) {
        let posts = JSON.parse(localStorage.getItem('lulipop_blog')) || [];
        if (posts.length === 0) {
            contBlog.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#666;">Pronto compartiremos videos y fotos del detrás de escena de Lulipop.</p>`;
        } else {
            contBlog.innerHTML = '';
            posts.forEach(post => {
                let mediaHtml = '';
                if (post.tipo === 'video') {
                    mediaHtml = `<video src="${post.media}" controls></video>`;
                } else {
                    mediaHtml = `<img src="${post.media}" alt="${post.titulo}">`;
                }
                contBlog.innerHTML += `
                    <div class="card">
                        ${mediaHtml}
                        <div class="card-body">
                            <small style="color:var(--color-secondary); font-weight:bold;">${post.fecha}</small>
                            <h3>${post.titulo}</h3>
                            <p>${post.texto}</p>
                        </div>
                    </div>`;
            });
        }
    }

    // 9. TESTIMONIOS
    const contTestimonios = document.getElementById('contenedor-testimonios');
    if (contTestimonios) {
        let testimonios = JSON.parse(localStorage.getItem('lulipop_testimonios')) || [
            { cliente: "María José", texto: "¡La torta quedó tal cual la pedimos y riquísima! Súper recomendable." }
        ];
        contTestimonios.innerHTML = '';
        testimonios.forEach(t => {
            contTestimonios.innerHTML += `
                <div class="testimonial-card">
                    <div class="stars"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div>
                    <p style="font-style:italic; color:#555; margin-bottom:10px;">"${t.texto}"</p>
                    <strong style="color:var(--color-primary);">- ${t.cliente}</strong>
                </div>`;
        });
    }

    // 10. FAQ
    const contFaq = document.getElementById('contenedor-faq');
    if (contFaq) {
        let faqs = JSON.parse(localStorage.getItem('lulipop_faq')) || [
            { pregunta: "¿Con cuántos días de anticipación debo hacer mi pedido?", respuesta: "Recomendamos encargar con al menos 4 a 5 días de anticipación para asegurar disponibilidad en nuestra agenda." },
            { pregunta: "¿Realizan opciones sin gluten o sin lactosa?", respuesta: "Sí, puedes indicarlo en el formulario de reserva para adaptar la receta a tus necesidades." }
        ];
        contFaq.innerHTML = '';
        faqs.forEach((f, idx) => {
            contFaq.innerHTML += `
                <div class="faq-item">
                    <button class="faq-question" onclick="toggleFaq(${idx})">
                        <span>${f.pregunta}</span>
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer" id="faq-ans-${idx}">${f.respuesta}</div>
                </div>`;
        });
    }
});

function toggleFaq(index) {
    const ans = document.getElementById(`faq-ans-${index}`);
    if (ans) {
        ans.style.display = ans.style.display === 'block' ? 'none' : 'block';
    }
}