const canvasElement = document.querySelector('canvas')
const canvasContext = canvasElement.getContext('2d')
canvasElement.width = innerWidth
canvasElement.height = innerHeight
const scoreEle = document.querySelector('#scoreEle')
const newGameBtn = document.querySelector('#newGameBtn')
const modal = document.querySelector('#modal')
let score = 0



class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }
  // draw player when this function is called
  draw() {
    canvasContext.beginPath()
    canvasContext.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    canvasContext.fillStyle = this.color
    canvasContext.fill()
  }
}




class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    canvasContext.beginPath()
    canvasContext.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    canvasContext.fillStyle = this.color
    canvasContext.fill()
  }

  update() {
    this.draw()
    this.x += this.velocity.x
    this.y += this.velocity.y
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    canvasContext.beginPath()
    canvasContext.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    canvasContext.fillStyle = this.color
    canvasContext.fill()
  }

  update() {
    this.draw()
    this.x += this.velocity.x
    this.y += this.velocity.y
  }
}

const friction = 0.98
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }

  draw() {
    canvasContext.save()
    canvasContext.globalAlpha = this.alpha
    canvasContext.beginPath()
    canvasContext.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    canvasContext.fillStyle = this.color
    canvasContext.fill()
    canvasContext.restore()
  }

  update() {
    this.draw()
    this.x += this.velocity.x
    this.y += this.velocity.y
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.alpha -= 0.01
  }
}

// position player in the center of the canvas
const playerPositionX = canvasElement.width / 2
const playerPositionY = canvasElement.height / 2
// new instance of player 
let player = new Player(playerPositionX, playerPositionY, 10, 'white')

let enemies = []
let projectiles = []
let particles = []

const init = () => {
  scoreEle.textContent = 0
  score = 0
  player = new Player(playerPositionX, playerPositionY, 10, 'white')
  enemies = []
  projectiles = []
  particles = []
}
const spawnEnemies = () => {
  setInterval(() => {
    const radius = Math.random() * (70 - 10) + 10
    let x
    let y
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvasElement.width + radius
      //  y = Math.random() < 0.5 ? 0 - radius : canvasElement.height + radius
      y = Math.random() * canvasElement.height
    } else {
      x = Math.random() * canvasElement.width
      y = Math.random() < 0.5 ? 0 - radius : canvasElement.height + radius
    }
    const color = `hsl(${Math.random() * 360},50%,50%)`

    const angle = Math.atan2(canvasElement.height / 2 - y, canvasElement.width / 2 - x)
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }
    enemies.push(new Enemy(x, y, radius, color, velocity))
  }, 1500)
}

let animationId
const animate = () => {
  animationId = requestAnimationFrame(animate)
  canvasContext.fillStyle = 'rgba(0,0,0,0.1)'
  canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height)
  player.draw()
  particles.forEach((particle, index) => {
    if (particle.alpha < 0.1) {
      setTimeout(() => {
        particles.splice(index, 1)
      }, 0)
    }
    particle.update()
  })
  projectiles.forEach((projectile, projectileIndex) => {
    projectile.update()

    //remove off screen bullets
    if (
      projectile.x + projectile.radius <= 0 ||
      projectile.x - projectile.radius > canvasElement.width ||
      projectile.y + projectile.radius <= 0 ||
      projectile.y - projectile.radius > canvasElement.height
    ) {
      setTimeout(() => {
        projectiles.splice(projectileIndex, 1)
      }, 0)
    }
  })

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update()
    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    // TODO implement end game
    if (distance - enemy.radius - player.radius <= 1) {
      cancelAnimationFrame(animationId)
      modal.children[0].children[0].textContent = score

      modal.classList.remove('hidden')

    }
    projectiles.forEach((projectile, projectileIndex) => {
      const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
      //collision detection
      if (distance - enemy.radius - projectile.radius <= 1) {


        for (let i = 0;i < enemy.radius * 2;i++) {
          particles.push(
            new Particle(projectile.x, projectile.y, Math.random() * 3, enemy.color, {
              x: (Math.random() - 0.5) * (Math.random() * 8),
              y: (Math.random() - 0.5) * (Math.random() * 8)
            }))
        }
        if (enemy.radius - 10 > 10) {
          gsap.to(enemy, {
            radius: enemy.radius - 10
          })
          score += 10
          scoreEle.textContent = score
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1)
          }, 0)
        } else {
          score += 25
          scoreEle.textContent = score
          setTimeout(() => {
            enemies.splice(enemyIndex, 1)
            projectiles.splice(projectileIndex, 1)
          }, 0)
        }

      }
    })
  })
}


addEventListener('mousedown', (event) => {
  const angle = Math.atan2(event.clientY - canvasElement.height / 2, event.clientX - canvasElement.width / 2)
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }
  projectiles.push(new Projectile(canvasElement.width / 2,
    canvasElement.height / 2,
    5,
    'white',
    velocity))
})



newGameBtn.addEventListener('click', () => {
  init()
  spawnEnemies()
  animate()
  modal.classList.add('hidden')
})