// Variables
let agents = []
let filteredAgents = []
let currentHeroIndex = 0
const cart = []
let selectedRole = "all"
let currentUser = null

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

// Elementos de autenticación
const loginBtn = document.getElementById("login-btn")
const registerBtn = document.getElementById("register-btn")
const logoutBtn = document.getElementById("logout-btn")
const userWelcome = document.getElementById("user-welcome")
const loginModal = document.getElementById("login-modal")
const registerModal = document.getElementById("register-modal")
const closeLoginBtn = document.getElementById("close-login")
const closeRegisterBtn = document.getElementById("close-register")
const loginForm = document.getElementById("login-form")
const registerForm = document.getElementById("register-form")
const switchToRegisterBtn = document.getElementById("switch-to-register")
const switchToLoginBtn = document.getElementById("switch-to-login")

// Inicializar la app
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus()
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

  // Event listeners de autenticación
  loginBtn.addEventListener("click", openLoginModal)
  registerBtn.addEventListener("click", openRegisterModal)
  logoutBtn.addEventListener("click", logout)
  closeLoginBtn.addEventListener("click", closeLoginModal)
  closeRegisterBtn.addEventListener("click", closeRegisterModal)
  switchToRegisterBtn.addEventListener("click", switchToRegister)
  switchToLoginBtn.addEventListener("click", switchToLogin)
  loginForm.addEventListener("submit", handleLogin)
  registerForm.addEventListener("submit", handleRegister)

  // Cerrar modales cuando se hace clic fuera
  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) {
      closeLoginModal()
    }
  })

  registerModal.addEventListener("click", (e) => {
    if (e.target === registerModal) {
      closeRegisterModal()
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
                <button class="card-add-btn" onclick="addToCart('${agent.uuid}')">AÑADIR AL CARRITO</button>
            </div>
        `

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

// ==================== FUNCIONES DE AUTENTICACIÓN ====================

// Verificar el estado de autenticación al cargar la página
function checkAuthStatus() {
  const user = localStorage.getItem('currentUser')
  if (user) {
    currentUser = JSON.parse(user)
    updateAuthUI()
  }
}

// Actualizar la interfaz de usuario según el estado de autenticación
function updateAuthUI() {
  if (currentUser) {
    // Usuario logueado
    loginBtn.style.display = 'none'
    registerBtn.style.display = 'none'
    logoutBtn.style.display = 'inline-block'
    userWelcome.style.display = 'inline-block'
    userWelcome.textContent = `¡HOLA, ${currentUser.name.toUpperCase()}!`
  } else {
    // Usuario no logueado
    loginBtn.style.display = 'inline-block'
    registerBtn.style.display = 'inline-block'
    logoutBtn.style.display = 'none'
    userWelcome.style.display = 'none'
  }
}

// Abrir modal de login
function openLoginModal() {
  loginModal.style.display = 'flex'
  clearAuthMessages()
}

// Cerrar modal de login
function closeLoginModal() {
  loginModal.style.display = 'none'
  clearAuthMessages()
  loginForm.reset()
}

// Abrir modal de registro
function openRegisterModal() {
  registerModal.style.display = 'flex'
  clearAuthMessages()
}

// Cerrar modal de registro
function closeRegisterModal() {
  registerModal.style.display = 'none'
  clearAuthMessages()
  registerForm.reset()
}

// Cambiar a modal de registro
function switchToRegister() {
  closeLoginModal()
  openRegisterModal()
}

// Cambiar a modal de login
function switchToLogin() {
  closeRegisterModal()
  openLoginModal()
}

// Manejar el envío del formulario de login
function handleLogin(e) {
  e.preventDefault()
  
  const email = document.getElementById('login-email').value
  const password = document.getElementById('login-password').value
  
  // Validar campos
  if (!email || !password) {
    showAuthMessage('Por favor, completa todos los campos', 'error', 'login')
    return
  }
  
  // Obtener usuarios del localStorage
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  
  // Buscar usuario
  const user = users.find(u => u.email === email && u.password === password)
  
  if (user) {
    // Login exitoso
    currentUser = user
    localStorage.setItem('currentUser', JSON.stringify(user))
    updateAuthUI()
    closeLoginModal()
    showAuthMessage('¡Bienvenido de vuelta!', 'success', 'login')
  } else {
    showAuthMessage('Email o contraseña incorrectos', 'error', 'login')
  }
}

// Manejar el envío del formulario de registro
function handleRegister(e) {
  e.preventDefault()
  
  const name = document.getElementById('register-name').value
  const email = document.getElementById('register-email').value
  const password = document.getElementById('register-password').value
  const confirmPassword = document.getElementById('register-confirm-password').value
  
  // Validar campos
  if (!name || !email || !password || !confirmPassword) {
    showAuthMessage('Por favor, completa todos los campos', 'error', 'register')
    return
  }
  
  // Validar que las contraseñas coincidan
  if (password !== confirmPassword) {
    showAuthMessage('Las contraseñas no coinciden', 'error', 'register')
    return
  }
  
  // Validar longitud de contraseña
  if (password.length < 6) {
    showAuthMessage('La contraseña debe tener al menos 6 caracteres', 'error', 'register')
    return
  }
  
  // Obtener usuarios del localStorage
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  
  // Verificar si el email ya existe
  if (users.find(u => u.email === email)) {
    showAuthMessage('Este email ya está registrado', 'error', 'register')
    return
  }
  
  // Crear nuevo usuario
  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password,
    createdAt: new Date().toISOString()
  }
  
  // Guardar usuario
  users.push(newUser)
  localStorage.setItem('users', JSON.stringify(users))
  
  // Loguear automáticamente
  currentUser = newUser
  localStorage.setItem('currentUser', JSON.stringify(newUser))
  updateAuthUI()
  closeRegisterModal()
  showAuthMessage('¡Registro exitoso! Bienvenido a la tienda', 'success', 'register')
}

// Cerrar sesión
function logout() {
  currentUser = null
  localStorage.removeItem('currentUser')
  updateAuthUI()
  showAuthMessage('Sesión cerrada correctamente', 'success', 'login')
}

// Mostrar mensajes de autenticación
function showAuthMessage(message, type, form) {
  const modal = form === 'login' ? loginModal : registerModal
  const formElement = form === 'login' ? loginForm : registerForm
  
  // Remover mensajes existentes
  const existingMessage = modal.querySelector('.auth-message')
  if (existingMessage) {
    existingMessage.remove()
  }
  
  // Crear nuevo mensaje
  const messageDiv = document.createElement('div')
  messageDiv.className = `auth-message ${type}`
  messageDiv.textContent = message
  
  // Insertar mensaje antes del formulario
  formElement.parentNode.insertBefore(messageDiv, formElement)
  
  // Auto-remover mensaje después de 5 segundos
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove()
    }
  }, 5000)
}

// Limpiar mensajes de autenticación
function clearAuthMessages() {
  const loginMessage = loginModal.querySelector('.auth-message')
  const registerMessage = registerModal.querySelector('.auth-message')
  
  if (loginMessage) loginMessage.remove()
  if (registerMessage) registerMessage.remove()
}
