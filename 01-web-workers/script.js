// Based in https://medium.com/samsung-internet-dev/web-workers-in-the-real-world-d61387958a40

// Spin the jolly
let rotation = 0;
setInterval(() => window.jolly.style.transform = `rotate(${rotation += 5}deg)`, 10);

// Attatch the regular event listener
window.btnmain.onclick = () => {
  document.getElementById('pi-result').textContent = 'working...';
  document.getElementById('pi-result').textContent = '3.' + pi(30000).slice(1);
}

// Attatch the event listener for using the worker
window.btnworker.onclick = async () => {
  if (!window.Worker) {
    document.getElementById('pi-result').textContent = 'Web worker not supported';
    return
  }
  
  document.getElementById('pi-result').textContent = 'working...';
  
  const piWorker = new Worker('pi-worker.js');
  piWorker.postMessage(30000);

  piWorker.onmessage = (e) => {
    document.getElementById('pi-result').textContent = '3.' + e.data
  }
};