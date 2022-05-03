// Based in https://medium.com/samsung-internet-dev/web-workers-in-the-real-world-d61387958a40

// Spin the jolly
let rotation = 0;
setInterval(() => window.jolly.style.transform = `rotate(${rotation += 5}deg)`, 10);

// Attatch the regular event listener
document.getElementById('btnmain').addEventListener('click', () => {
  document.getElementById('result').textContent = 'working...';
  document.getElementById('result').textContent = '3.' + pi(30000).slice(1);
})

// Attatch the event listener for using the worker
document.getElementById('btnworker').addEventListener('click', () => {
  if (!window.Worker) {
    document.getElementById('result').textContent = 'Web worker not supported';
    return
  }

  document.getElementById('result').textContent = 'working...';

  const piWorker = new Worker('pi-worker.js');
  piWorker.postMessage(30000);

  piWorker.addEventListener('message', (e) => {
    document.getElementById('result').textContent = '3.' + e.data
  })
})