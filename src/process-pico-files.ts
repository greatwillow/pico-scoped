const postcss = require('postcss')
const fs = require('fs')
const postcssPrefixWrap = require('postcss-prefixwrap')

const orignalCssFilesDirectory = './pico-original-files'
const processedCssFilesDirectory = './pico-processed-files'
const picoStylesGlobalScopeName = '.pico-styles'
const rootCssPseudoClassRegex = /:root/g

const handleReadFilesError = (error: Error) => handleError(error, 'reading files')
const handleReadFileError = (error: Error) => handleError(error, 'reading file')
const handleWriteFileError = (error: Error) => handleError(error, 'writing file')
const handleProcessingFileError = (error: Error) => handleError(error, 'processing file')

const logReadFileAction = (file: string) => console.log('Reading file: ', file)
const logWriteFileAction = (file: string) => console.log('Writing file: ', file)

function handleError(error: Error, message: string) {
	if (error) {
		console.error(`Error while ${message} with error: ${error}`)
	}
}

function createScopedPicoFile(
	originalFileName: string, 
	originalCss: string,
	outputDirectory: string,
	cssGlobalScopeName: string = picoStylesGlobalScopeName,
	rootRegex: RegExp = rootCssPseudoClassRegex
) {
	postcss([postcssPrefixWrap(cssGlobalScopeName)])
		.process(originalCss, { from: undefined })
		.then((result: { css: string }) => {
			const processedCss = result.css.replace(rootRegex, cssGlobalScopeName)
			const processedCssFileName = `scoped.${originalFileName}`
			const processedFileAndDirectory = `${outputDirectory}/${processedCssFileName}`

			logWriteFileAction(processedFileAndDirectory)

			if (!fs.existsSync(outputDirectory)) {
				fs.mkdirSync(outputDirectory, { recursive: true });
			}

			fs.writeFile(
				processedFileAndDirectory,
				processedCss,
				handleWriteFileError
			)
		})
		.catch(handleProcessingFileError)
}

function createScopedPicoFiles(
	inputDirectory: string,
	outputDirectory: string,	
	) {
	const originalPicoFiles = [...fs.readdirSync(inputDirectory, handleReadFilesError)]

	originalPicoFiles.forEach((originalFileName) => {
		const originalFileAndDirectory = `${inputDirectory}/${originalFileName}`

		logReadFileAction(originalFileAndDirectory)

		fs.readFile(`${inputDirectory}/${originalFileName}`, (readFileError: Error, originalCss: string) => {
			handleReadFileError(readFileError)
			createScopedPicoFile(originalFileName, originalCss, outputDirectory)
		})
	})
}

createScopedPicoFiles(orignalCssFilesDirectory, processedCssFilesDirectory)

export {
	createScopedPicoFile,
	createScopedPicoFiles
}


