function getFileContent(file) {
  return new Promise((resolve) => {
    const fileReader = new FileReader()

    fileReader.addEventListener('load', () => {
      resolve(fileReader.result)
    })

    fileReader.readAsText(file)
  })
}

function convertCsvToJson(csv) {
  const lines = csv.split('\n');
  const keys = lines[0].split(',').map(key => key.replace(/\"/g, ''));
  const items = lines.slice(1).map(line => {
    return line.split(',').reduce((acc, cur, i) => {
      const toAdd = {};
      toAdd[keys[i]] = cur.replace(/\"/g, '');
      return { ...acc, ...toAdd };
    }, {});
  });

  return items;
}

function generateMonthlyReport(items) {
  return Object.entries(items
    .reduce((acc, item) => {
      const month = item.created_at.slice(0, 7)
      let items = acc[month] || [];
      items.push(parseFloat(item.total));
      acc[month] = items;
      return acc;
    }, {}))
    .map((x) => {
      let month = x[0];
      let total = x[1];
      let sum = total.reduce((a, b) => a + b, 0);
      let average = (sum / total.length) || 0;
      return { "month": month, "average": average, "sum": sum };
    });
}
function generateYearlyReport(items) {
  return Object.entries(items
    .reduce((acc, item) => {
      const year = item.created_at.slice(0, 4)
      let items = acc[year] || [];
      items.push(parseFloat(item.total));
      acc[year] = items;
      return acc;
    }, {}))
    .map((x) => {
      let year = x[0];
      let total = x[1];
      let sum = total.reduce((a, b) => a + b, 0);
      let average = (sum / total.length) || 0;
      return { "year": year, "average": average, "sum": sum };
    });
}


async function csvInsights(file) {
  const csv = await getFileContent(file)
  const items = convertCsvToJson(csv)

  const monthlyReport = generateMonthlyReport(items)
  const yearlyReport = generateYearlyReport(items)

  return {
    columnsNames: Object.keys(items[0]),
    count: items.length,
    monthlyReport,
    yearlyReport,
  };
}

self.addEventListener("message", async (e) => {
  const result = await csvInsights(e.data.file);
  self.postMessage(result);
})