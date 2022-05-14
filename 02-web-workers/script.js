// Spin the jolly
document.getElementById('btn-rotate').addEventListener('click', (e) => {
  e.target.setAttribute('disabled', true)
  let rotation = 0
  setInterval(() => {
    document.getElementById('jolly').style.transform = `rotate(${rotation += 2}deg)`
  }, 10)
})

// File Field event listener
let file = ''
document.getElementById('file-input').addEventListener('change', (e) => {
  file = e.target.files[0]
  document.getElementById('file-label').innerText = file.name
})

// Regular btn event listener
document.getElementById('btn-main').addEventListener('click', async () => {
  document.getElementById('result').textContent = `working...`
  const result = await window.csvInsights(file)
  console.log('result -> ', result)
  // document.getElementById('result').textContent = `File parsed. ${insights.count} rows found.`
})


// Initialize the Worker
const csvJSONWorker = new Worker('csv-insights-worker.js')

// Attatch the event listener for using the worker
document.getElementById('btn-worker').addEventListener('click', (e) => {
  if (!window.Worker) {
    window.alert('Web worker not supported')
    return
  }

  document.getElementById('result').textContent = `working...`

  csvJSONWorker.postMessage({ file: file })
  csvJSONWorker.addEventListener('message', (e) => {
    const result = e.data
    console.log('result -> ', result)
    // document.getElementById('result').textContent = `File parsed. ${result.count} rows found.`
  })
})