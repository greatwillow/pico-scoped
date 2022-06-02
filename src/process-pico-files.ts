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

function createScopedPicoFile(originalFileName: string, originalCss: string) {
	postcss([postcssPrefixWrap(picoStylesGlobalScopeName)])
		.process(originalCss, { from: undefined })
		.then((result: { css: string }) => {
			const processedCss = result.css.replace(rootCssPseudoClassRegex, picoStylesGlobalScopeName)
			const processedCssFileName = `scoped.${originalFileName}`
			const processedFileAndDirectory = `${processedCssFilesDirectory}/${processedCssFileName}`

			logWriteFileAction(processedFileAndDirectory)

			if (!fs.existsSync(processedCssFilesDirectory)) {
				fs.mkdirSync(processedCssFilesDirectory, { recursive: true });
			}

			fs.writeFile(
				processedFileAndDirectory,
				processedCss,
				handleWriteFileError
			)
		})
		.catch(handleProcessingFileError)
}

function createScopedPicoFiles() {
	const originalPicoFiles = [...fs.readdirSync(orignalCssFilesDirectory, handleReadFilesError)]

	originalPicoFiles.forEach((originalFileName) => {
		const originalFileAndDirectory = `${orignalCssFilesDirectory}/${originalFileName}`

		logReadFileAction(originalFileAndDirectory)

		fs.readFile(`${orignalCssFilesDirectory}/${originalFileName}`, (readFileError: Error, originalCss: string) => {
			handleReadFileError(readFileError)
			createScopedPicoFile(originalFileName, originalCss)
		})
	})
}

createScopedPicoFiles()


