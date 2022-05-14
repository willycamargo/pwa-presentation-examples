// Based in https://medium.com/samsung-internet-dev/web-workers-in-the-real-world-d61387958a40

// Spin the jolly
document.getElementById('btn-rotate').addEventListener('click', (e) => {
  e.target.setAttribute('disabled', true)
  let rotation = 0
  setInterval(() => {
    document.getElementById('jolly').style.transform = `rotate(${rotation += 2}deg)`
  }, 10)
})

// Attatch the regular event listener
document.getElementById('btn-main').addEventListener('click', () => {
  document.getElementById('result').textContent = 'working...'
  document.getElementById('result').textContent = '3.' + window.pi(30000).slice(1)
})

// Initialize the Worker
const piWorker = new Worker('pi-worker.js')

// Attatch the event listener for using the worker
document.getElementById('btn-worker').addEventListener('click', () => {
  if (!window.Worker) {
    document.getElementById('result').textContent = 'Web worker not supported'
    return
  }

  document.getElementById('result').textContent = 'working...'

  piWorker.postMessage(30000)

  piWorker.addEventListener('message', (e) => {
    document.getElementById('result').textContent = '3.' + e.data
  })
})