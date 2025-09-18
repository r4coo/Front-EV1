// Variables
let agents = []
let filteredAgents = []
let currentHeroIndex = 0
const cart = []
let selectedRole = "all"

// Elementos DOM
const loadingScreen = document.getElementById("loading")
const heroSection = document.getElementById("hero-section")
const filtersSection = document.getElementById("filters-section")
const agentsSection = document.getElementById("agents-section")
const cartCount = document.getElementById("cart-count")
const agentsGrid = document.getElementById("agents-grid")

// Elementos Hero
const heroName = document.getElementById("hero-name")
const heroDescription = document.getElementById("hero-description")
const heroImage = document.getElementById("hero-image")
const heroAbilities = document.getElementById("hero-abilities")
const heroAddCart = document.getElementById("hero-add-cart")
const prevHeroBtn = document.getElementById("prev-hero")
const nextHeroBtn = document.getElementById("next-hero")

const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const closeCartBtn = document.getElementById("close-cart")
const cartItems = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const clearCartBtn = document.getElementById("clear-cart")
const checkoutBtn = document.getElementById("checkout")

// Elementos del modal de personaje
const characterModal = document.getElementById("character-modal")
const closeCharacterBtn = document.getElementById("close-character")
const characterModalName = document.getElementById("character-modal-name")
const characterModalImage = document.getElementById("character-modal-image")
const characterModalRole = document.getElementById("character-modal-role")
const characterModalBio = document.getElementById("character-modal-bio")
const characterAbilitiesList = document.getElementById("character-abilities-list")
const characterAddToCartBtn = document.getElementById("character-add-to-cart")

// Elementos de especificaciones de figura
const figureHeight = document.getElementById("figure-height")
const figureWeight = document.getElementById("figure-weight")
const figureMaterial = document.getElementById("figure-material")
const figureJoints = document.getElementById("figure-joints")
const figureAccessories = document.getElementById("figure-accessories")
const figureAge = document.getElementById("figure-age")

// Inicializar la app
document.addEventListener("DOMContentLoaded", () => {
  fetchAgents()
  setupEventListeners()
})

// Obtener agentes de la API de Valorant
async function fetchAgents() {
  try {
    const response = await fetch("https://valorant-api.com/v1/agents?language=es-ES&isPlayableCharacter=true")
    const data = await response.json()

    if (data.data) {
      agents = data.data.filter((agent) => agent.fullPortrait)
      filteredAgents = [...agents]

      // Debug: Log todos los roles disponibles
      const roles = [...new Set(agents.map(agent => agent.role?.displayName).filter(Boolean))]
      console.log("Available roles:", roles)
      
      // Debug: Log primeros 5 agentes con sus roles
      agents.slice(0, 5).forEach(agent => {
        console.log(`Agent: ${agent.displayName}, Role: ${agent.role?.displayName}`)
      })

      hideLoading()
      updateHeroCarousel()
      renderAgents()
    }
  } catch (error) {
    console.error("Error fetching agents:", error)
    hideLoading()
  }
}

// Ocultar la pantalla de carga y mostrar el contenido
function hideLoading() {
  loadingScreen.style.display = "none"
  heroSection.style.display = "block"
  filtersSection.style.display = "block"
  agentsSection.style.display = "block"
}

// Configurar los event listeners
function setupEventListeners() {
  // Controles del carousel del hero
  prevHeroBtn.addEventListener("click", () => {
    currentHeroIndex = (currentHeroIndex - 1 + filteredAgents.length) % filteredAgents.length
    updateHeroCarousel()
  })

  nextHeroBtn.addEventListener("click", () => {
    currentHeroIndex = (currentHeroIndex + 1) % filteredAgents.length
    updateHeroCarousel()
  })

  // Botones de filtro
  const filterButtons = document.querySelectorAll(".filter-btn")
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const role = e.target.dataset.role
      console.log("Filter button clicked:", role)

      // Actualizar el botón activo
      filterButtons.forEach((b) => b.classList.remove("active"))
      e.target.classList.add("active")

      // Filtrar agentes
      selectedRole = role
      filterAgents()
    })
  })

  cartBtn.addEventListener("click", openCart)
  closeCartBtn.addEventListener("click", closeCart)
  clearCartBtn.addEventListener("click", clearCart)
  checkoutBtn.addEventListener("click", checkout)

  // Cerrar el modal cuando se hace clic fuera
  cartModal.addEventListener("click", (e) => {
    if (e.target === cartModal) {
      closeCart()
    }
  })

    // Event listeners del modal de personaje
  closeCharacterBtn.addEventListener("click", closeCharacterModal)
  characterAddToCartBtn.addEventListener("click", addCharacterToCart)
  
  // Cerrar modal de personaje cuando se hace clic fuera
  characterModal.addEventListener("click", (e) => {
    if (e.target === characterModal) {
      closeCharacterModal()
    }
  })
}

// Función de mapping de roles - maneja tanto inglés como español
function getRoleDisplayName(role) {
  const roleMap = {
    "Duelist": "Duelista",
    "Controller": "Controlador", 
    "Sentinel": "Centinela",
    "Initiator": "Iniciador"
  }
  return roleMap[role] || role
}

// Verificar si el rol del agente coincide con el filtro seleccionado
function isRoleMatch(agentRole, selectedRole) {
  if (selectedRole === "all") return true
  
  // Coincidencia directa
  if (agentRole === selectedRole) return true
  
  // Verificar el rol mapeado
  const mappedRole = getRoleDisplayName(selectedRole)
  if (agentRole === mappedRole) return true
  
  // Verificar el mapping inverso (en caso de que la API devuelva español pero tenemos inglés)
  const reverseMap = {
    "Duelista": "Duelist",
    "Controlador": "Controller",
    "Centinela": "Sentinel", 
    "Iniciador": "Initiator"
  }
  if (agentRole === reverseMap[selectedRole]) return true
  
  return false
}

// Filtrar agentes por rol
function filterAgents() {
  console.log("Filtering by role:", selectedRole)
  
  if (selectedRole === "all") {
    filteredAgents = [...agents]
  } else {
    filteredAgents = agents.filter((agent) => {
      const agentRole = agent.role?.displayName
      const isMatch = isRoleMatch(agentRole, selectedRole)
      console.log(`Agent: ${agent.displayName}, Role: ${agentRole}, Looking for: ${selectedRole}, Match: ${isMatch}`)
      return isMatch
    })
  }

  console.log(`Filtered agents count: ${filteredAgents.length}`)

  // Resetear el índice del hero y actualizar el carousel
  currentHeroIndex = 0
  // Asegurar que el índice no exceda la longitud de los agentes filtrados
  if (currentHeroIndex >= filteredAgents.length) {
    currentHeroIndex = 0
  }
  updateHeroCarousel()
  renderAgents()
}

// Actualizar el carousel del hero
function updateHeroCarousel() {
  if (filteredAgents.length === 0) {
    console.log("No filtered agents available")
    return
  }

  // Asegurar que el índice del hero es válido
  if (currentHeroIndex >= filteredAgents.length) {
    currentHeroIndex = 0
  }

  const currentAgent = filteredAgents[currentHeroIndex]
  console.log("Updating hero carousel with agent:", currentAgent.displayName)

  heroName.textContent = currentAgent.displayName.toUpperCase()
  heroDescription.textContent = currentAgent.description
  heroImage.src = currentAgent.fullPortrait || "/placeholder.svg"
  heroImage.alt = currentAgent.displayName

  // Actualizar las habilidades
  heroAbilities.innerHTML = ""
  if (currentAgent.abilities) {
    currentAgent.abilities.slice(0, 4).forEach((ability) => {
      const abilityDiv = document.createElement("div")
      abilityDiv.className = "ability-icon"
      abilityDiv.innerHTML = `<img src="${ability.displayIcon || "/placeholder.svg"}" alt="${ability.displayName}">`
      heroAbilities.appendChild(abilityDiv)
    })
  }

  // Actualizar el botón de añadir al carrito
  heroAddCart.onclick = () => addToCart(currentAgent.uuid)
}

// Renderizar el grid de agentes
function renderAgents() {
  console.log(`Rendering ${filteredAgents.length} agents`)
  agentsGrid.innerHTML = ""

  filteredAgents.forEach((agent) => {
    const agentCard = document.createElement("div")
    agentCard.className = "agent-card"
    agentCard.style.cursor = "pointer"

    agentCard.innerHTML = `
            <div class="agent-image-container">
                <img src="${agent.fullPortrait || "/placeholder.svg"}" alt="${agent.displayName}">
            </div>
            <div class="agent-card-content">
                <h3 class="agent-name">${agent.displayName.toUpperCase()}</h3>
                <div class="agent-role">${agent.role?.displayName.toUpperCase() || "AGENTE"}</div>
                <div class="card-purchase-section">
                    <div class="card-price-info">
                        <div class="card-price">$29.99</div>
                        <div class="card-price-label">Figura Premium</div>
                    </div>
                </div>
                <button class="card-add-btn" onclick="event.stopPropagation(); addToCart('${agent.uuid}')">AÑADIR AL CARRITO</button>
            </div>
        `

    // Agregar evento de clic para mostrar información del personaje
    agentCard.addEventListener("click", () => {
      showCharacterModal(agent)
    })

    agentsGrid.appendChild(agentCard)
  })
}

// Añadir al carrito
function addToCart(agentId) {
  const agent = agents.find((a) => a.uuid === agentId)
  if (!agent) return

  const existingItem = cart.find((item) => item.id === agentId)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      id: agentId,
      name: agent.displayName,
      image: agent.fullPortrait,
      price: 29.99,
      quantity: 1,
    })
  }

  updateCartCount()
  showAddedToCartFeedback()
}

// Actualizar el contador de items en el carrito
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  cartCount.textContent = totalItems
}

// Abrir el carrito
function openCart() {
  renderCartItems()
  cartModal.style.display = "flex"
}

// Cerrar el carrito
function closeCart() {
  cartModal.style.display = "none"
}

// Renderizar los items en el carrito
function renderCartItems() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-cart">TU CARRITO ESTÁ VACÍO</div>'
    cartTotal.textContent = "0.00"
    return
  }

  cartItems.innerHTML = ""
  let total = 0

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity
    total += itemTotal

    const cartItem = document.createElement("div")
    cartItem.className = "cart-item"
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name.toUpperCase()}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
      </div>
      <div class="cart-item-controls">
        <button class="quantity-btn" onclick="decreaseQuantity(${index})">-</button>
        <span class="quantity">${item.quantity}</span>
        <button class="quantity-btn" onclick="increaseQuantity(${index})">+</button>
        <button class="remove-btn" onclick="removeFromCart(${index})">ELIMINAR</button>
      </div>
    `
    cartItems.appendChild(cartItem)
  })

  cartTotal.textContent = total.toFixed(2)
}

// Incrementar la cantidad de un item en el carrito
function increaseQuantity(index) {
  cart[index].quantity += 1
  updateCartCount()
  renderCartItems()
}

// Decrementar la cantidad de un item en el carrito
function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1
  } else {
    cart.splice(index, 1)
  }
  updateCartCount()
  renderCartItems()
}

// Eliminar un item del carrito
function removeFromCart(index) {
  cart.splice(index, 1)
  updateCartCount()
  renderCartItems()
}

// Vaciar el carrito
function clearCart() {
  cart.length = 0
  updateCartCount()
  renderCartItems()
}

// Finalizar la compra
function checkout() {
  if (cart.length === 0) {
    alert("Tu carrito está vacío")
    return
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  alert(`¡Gracias por tu compra!\nTotal: $${total.toFixed(2)}\n\nEsto es una demo - no se procesará ningún pago real.`)
  clearCart()
  closeCart()
}

// Mostrar el feedback de que se ha añadido al carrito
      function showAddedToCartFeedback() {
  // Feedback simple - podría mejorarse con una notificación de toast
  const originalText = cartBtn.textContent
  cartBtn.style.background = "linear-gradient(45deg, #00ff00, #32cd32)"
  setTimeout(() => {
    cartBtn.style.background = "linear-gradient(45deg, #1e3a8a, #3b82f6)"
  }, 300)
}
// ==================== FUNCIONES DEL MODAL DE PERSONAJE ====================

// Mostrar modal con información del personaje
function showCharacterModal(agent) {
  // Actualizar información básica
  characterModalName.textContent = agent.displayName.toUpperCase()
  characterModalImage.src = agent.fullPortrait || "/placeholder.svg"
  characterModalImage.alt = agent.displayName
  characterModalRole.textContent = agent.role?.displayName.toUpperCase() || "AGENTE"
  characterModalBio.textContent = agent.description || "Información no disponible"

  // Actualizar especificaciones de figura
  updateFigureSpecs(agent)

  // Renderizar habilidades
  renderCharacterAbilities(agent.abilities || [])

  // Configurar botón de añadir al carrito
  characterAddToCartBtn.onclick = () => {
    addToCart(agent.uuid)
    closeCharacterModal()
  }

  // Mostrar modal
  characterModal.style.display = "flex"
}

// Renderizar las habilidades del personaje
function renderCharacterAbilities(abilities) {
  characterAbilitiesList.innerHTML = ""

  if (!abilities || abilities.length === 0) {
    characterAbilitiesList.innerHTML = '<p style="color: #ffffff; font-size: 0.5rem;">No hay información de habilidades disponible</p>'
    return
  }

  abilities.forEach((ability) => {
    const abilityItem = document.createElement("div")
    abilityItem.className = "ability-item"

    abilityItem.innerHTML = `
      <div class="ability-icon">
        <img src="${ability.displayIcon || "/placeholder.svg"}" alt="${ability.displayName}">
      </div>
      <div class="ability-info">
        <div class="ability-name">${ability.displayName.toUpperCase()}</div>
        <div class="ability-description">${ability.description || "Descripción no disponible"}</div>
      </div>
    `

    characterAbilitiesList.appendChild(abilityItem)
  })
}

// Cerrar modal de personaje
function closeCharacterModal() {
  characterModal.style.display = "none"
}

// Actualizar especificaciones de figura basadas en el personaje
function updateFigureSpecs(agent) {
  // Generar especificaciones únicas basadas en el personaje
  const specs = generateFigureSpecs(agent)
  
  figureHeight.textContent = specs.height
  figureWeight.textContent = specs.weight
  figureMaterial.textContent = specs.material
  figureJoints.textContent = specs.joints
  figureAccessories.textContent = specs.accessories
  figureAge.textContent = specs.age
}

// Generar especificaciones únicas para cada personaje
function generateFigureSpecs(agent) {
  const role = agent.role?.displayName || "Agent"
  const name = agent.displayName.toLowerCase()
  
  // Especificaciones base que varían según el rol y personaje
  const baseSpecs = {
    height: "25 cm",
    weight: "450 g",
    material: "PVC Premium",
    joints: "15 puntos",
    accessories: "Base + Armas",
    age: "14+ años"
  }
  
  // Variaciones según el rol
  switch (role) {
    case "Duelist":
      baseSpecs.height = "26 cm"
      baseSpecs.weight = "480 g"
      baseSpecs.joints = "18 puntos"
      baseSpecs.accessories = "Base + Armas + Efectos"
      break
    case "Controller":
      baseSpecs.height = "24 cm"
      baseSpecs.weight = "420 g"
      baseSpecs.joints = "16 puntos"
      baseSpecs.accessories = "Base + Dispositivos"
      break
    case "Sentinel":
      baseSpecs.height = "25 cm"
      baseSpecs.weight = "460 g"
      baseSpecs.joints = "17 puntos"
      baseSpecs.accessories = "Base + Equipos Defensivos"
      break
    case "Initiator":
      baseSpecs.height = "25 cm"
      baseSpecs.weight = "440 g"
      baseSpecs.joints = "16 puntos"
      baseSpecs.accessories = "Base + Herramientas de Reconocimiento"
      break
  }
  
  // Variaciones específicas por personaje
  if (name.includes("jett")) {
    baseSpecs.height = "24 cm"
    baseSpecs.weight = "420 g"
    baseSpecs.accessories = "Base + Cuchillos + Efectos de Viento"
  } else if (name.includes("sage")) {
    baseSpecs.height = "25 cm"
    baseSpecs.weight = "450 g"
    baseSpecs.accessories = "Base + Orbe de Curación + Efectos de Hielo"
  } else if (name.includes("phoenix")) {
    baseSpecs.height = "26 cm"
    baseSpecs.weight = "480 g"
    baseSpecs.accessories = "Base + Bola de Fuego + Efectos de Llamas"
  } else if (name.includes("sova")) {
    baseSpecs.height = "26 cm"
    baseSpecs.weight = "470 g"
    baseSpecs.accessories = "Base + Arco + Flechas + Dron"
  } else if (name.includes("viper")) {
    baseSpecs.height = "25 cm"
    baseSpecs.weight = "460 g"
    baseSpecs.accessories = "Base + Dispositivos de Gas + Efectos Tóxicos"
  } else if (name.includes("cypher")) {
    baseSpecs.height = "25 cm"
    baseSpecs.weight = "450 g"
    baseSpecs.accessories = "Base + Cámaras + Cables + Efectos de Vigilancia"
  } else if (name.includes("reyna")) {
    baseSpecs.height = "25 cm"
    baseSpecs.weight = "460 g"
    baseSpecs.accessories = "Base + Orbe de Vida + Efectos de Almas"
  } else if (name.includes("killjoy")) {
    baseSpecs.height = "24 cm"
    baseSpecs.weight = "430 g"
    baseSpecs.accessories = "Base + Turret + Alarmbot + Nanoswarm"
  } else if (name.includes("breach")) {
    baseSpecs.height = "27 cm"
    baseSpecs.weight = "500 g"
    baseSpecs.accessories = "Base + Dispositivos Sísmicos + Efectos de Terremoto"
  } else if (name.includes("omen")) {
    baseSpecs.height = "26 cm"
    baseSpecs.weight = "480 g"
    baseSpecs.accessories = "Base + Orbes de Sombra + Efectos de Teletransporte"
  } else if (name.includes("raze")) {
    baseSpecs.height = "25 cm"
    baseSpecs.weight = "470 g"
    baseSpecs.accessories = "Base + Granadas + Bot + Efectos Explosivos"
  } else if (name.includes("skye")) {
    baseSpecs.height = "25 cm"
    baseSpecs.weight = "450 g"
    baseSpecs.accessories = "Base + Animales Espirituales + Efectos de Naturaleza"
  } else if (name.includes("yoru")) {
    baseSpecs.height = "26 cm"
    baseSpecs.weight = "480 g"
    baseSpecs.accessories = "Base + Máscara + Efectos Dimensionales"
  } else if (name.includes("astra")) {
    baseSpecs.height = "25 cm"
    baseSpecs.weight = "460 g"
    baseSpecs.accessories = "Base + Estrellas + Efectos Cósmicos"
  } else if (name.includes("kay/o")) {
    baseSpecs.height = "26 cm"
    baseSpecs.weight = "490 g"
    baseSpecs.accessories = "Base + Cuchillo + Efectos de Supresión"
  } else if (name.includes("chamber")) {
    baseSpecs.height = "26 cm"
    baseSpecs.weight = "480 g"
    baseSpecs.accessories = "Base + Armas Personalizadas + Efectos de Elegancia"
  } else if (name.includes("neon")) {
    baseSpecs.height = "25 cm"
    baseSpecs.weight = "450 g"
    baseSpecs.accessories = "Base + Efectos Eléctricos + Carril de Velocidad"
  } else if (name.includes("fade")) {
    baseSpecs.height = "25 cm"
    baseSpecs.weight = "460 g"
    baseSpecs.accessories = "Base + Pesadillas + Efectos de Terror"
  } else if (name.includes("harbor")) {
    baseSpecs.height = "26 cm"
    baseSpecs.weight = "480 g"
    baseSpecs.accessories = "Base + Escudo de Agua + Efectos Acuáticos"
  } else if (name.includes("gekko")) {
    baseSpecs.height = "25 cm"
    baseSpecs.weight = "450 g"
    baseSpecs.accessories = "Base + Criaturas + Efectos Biológicos"
  } else if (name.includes("deadlock")) {
    baseSpecs.height = "25 cm"
    baseSpecs.weight = "460 g"
    baseSpecs.accessories = "Base + Nanofilamentos + Efectos de Contención"
  } else if (name.includes("iso")) {
    baseSpecs.height = "26 cm"
    baseSpecs.weight = "480 g"
    baseSpecs.accessories = "Base + Efectos Dimensionales + Escudo de Energía"
  } else if (name.includes("clove")) {
    baseSpecs.height = "25 cm"
    baseSpecs.weight = "450 g"
    baseSpecs.accessories = "Base + Efectos de Humo + Regeneración"
  }
  
  return baseSpecs
}

// Añadir personaje al carrito desde el modal
function addCharacterToCart() {
  // Esta función se configura dinámicamente en showCharacterModal
  // para usar el agente correcto
}
