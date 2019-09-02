const fs = require('fs')
const { EOL } = require('os')

function filterFile(inputDir, outputDir, filename) {
  const entryFile = fs.readFileSync(`${inputDir}/${filename}`, { encoding: 'utf-8' })
  const entryFileLines = entryFile.split(/\r?\n/g)

  let filteredArray = []
  entryFileLines.map((line, key) => {
    if (line.includes(',N ')) {
      filteredArray.push({
        sortIndex: key,
        type: 'name',
        value: line.split(',')[1].replace('PN', '')
      })
      filteredArray.push({
        sortIndex: key + 1,
        type: 'x',
        value: line.split(',')[2].replace('N ', '')
      })
      filteredArray.push({
        sortIndex: key + 2,
        type: 'y',
        value: line.split(',')[3].replace('E ', '')
      })
      filteredArray.push({
        sortIndex: key + 3,
        type: 'h',
        value: line.split(',')[4].replace('EL', '')
      })
    }
    if (line.includes('Depth:')) {
      filteredArray.push({
        sortIndex: key + 7,
        type: 'depth',
        value: line.split('Depth:').pop().split(',').toString()
      })
    }
  })

  filteredArray.sort((a,b) => (a.sortIndex > b.sortIndex) ? 1 : ((b.sortIndex > a.sortIndex) ? -1 : 0));

  // console.log(filteredArray)

  let results = []
  let pointData = ''
  filteredArray.map((data, key, array) => {
    if (data.type === 'name') {
      if (pointData !== '') {
        results.push(pointData.trim()) 
      }
      pointData = ''
      pointData += data.value + ' '
    } else if (data.type === 'h') {
      if (array[key + 1] && array[key + 1].type === 'depth') {
        pointData += (+data.value + +array[key + 1].value).toFixed(4) + ' '
      } else {
        pointData += data.value + ' '
      }
    } else {
      pointData += data.value + ' '
    }
    if (array.length === key + 1) {
      results.push(pointData.trim())
    }
  })

  fs.writeFile(`${outputDir}/${filename}`, results.join(EOL), function(err) {
    if(err) {
      return console.log(err)
    }
  })

  console.log(`${filename} - gotowy!`)
}

function filterAllFiles(inputDir, outputDir) {
  fs.readdir(inputDir, (err, filenames) => {
    if (err) {
      onError(err)
      return
    }
    filenames.forEach(filename => {
      filterFile(inputDir, outputDir, filename)
    })
  })
}

filterAllFiles('./input', './output')