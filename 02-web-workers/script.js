let chart = null

function renderChart(result) {
  if (chart) {
    chart.destroy()
    chart = null
  }

  const labels = result.monthlyReport.map((m) => m.month)
  const data = result.monthlyReport.map((m) => m.sum)

  const ctx = document.getElementById('result').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Sum of Orders US',
        data: data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

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
  document.getElementById('status').textContent = 'working...'
  const result = await window.generateReportFromCSV(file)
  renderChart(result)
  document.getElementById('status').textContent = ''
})


// Initialize the Worker
const csvReportWorker = new Worker('csv-report-worker.js')

// Attatch the event listener for using the worker
document.getElementById('btn-worker').addEventListener('click', (e) => {
  document.getElementById('status').textContent = 'working...'

  csvReportWorker.postMessage({ file: file })
  csvReportWorker.addEventListener('message', (e) => {
    const result = e.data
    renderChart(result)
    document.getElementById('status').textContent = ''
  })
})