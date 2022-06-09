const postcss = require('postcss')
const fs = require('fs')
const postcssPrefixWrap = require('postcss-prefixwrap')

const handleReadFilesError = (error: Error) => handleError(error, 'reading files')
const handleReadFileError = (error: Error) => handleError(error, 'reading file')
const handleWriteFileError = (error: Error) => handleError(error, 'writing file')
const handleProcessingFileError = (error: Error) => handleError(error, 'processing file')

const logReadFileAction = (file: string) => process.stdout.write(`Reading file: ${file}`)
const logWriteFileAction = (file: string) => process.stdout.write(`Writing file: ${file}`)

function handleError(error: Error, message: string) {
    if(error) 
        process.stderr.write(`Error while ${message} with error: ${error}`)
	
}

function createScopedPicoFile(
    originalFileName: string, 
    originalCss: string,
    outputDirectory: string
): Promise<void> {
    const picoStylesGlobalScopeName = '.pico-styles'
    const rootCssPseudoClassRegex = /:root/g

    return postcss([postcssPrefixWrap('.pico-styles')])
        .process(originalCss, { from: undefined })
        .then((result: { css: string }) => {
            const processedCss = result.css.replace(rootCssPseudoClassRegex, picoStylesGlobalScopeName)
            const processedCssFileName = `scoped.${originalFileName}`
            const processedFileAndDirectory = `${outputDirectory}/${processedCssFileName}`

            logWriteFileAction(processedFileAndDirectory)

            if(!fs.existsSync(outputDirectory)) 
                fs.mkdirSync(outputDirectory, { recursive: true })
			

            fs.writeFileSync(
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
): Array<Promise<void>> {
    const originalPicoFiles = [...fs.readdirSync(inputDirectory, handleReadFilesError)]
    const promises: Array<Promise<void>> = originalPicoFiles.map((originalFileName) => {
        const originalFileAndDirectory = `${inputDirectory}/${originalFileName}`

        logReadFileAction(originalFileAndDirectory)
		
        return new Promise((resolve, reject) => {
            fs.readFile(`${inputDirectory}/${originalFileName}`, async (readFileError: Error, originalCss: string) => {
                if(readFileError) {
                    handleReadFileError(readFileError)
                    reject()
                }
				
                await createScopedPicoFile(originalFileName, originalCss, outputDirectory)

                resolve()
            })
        }) 
    })

    return promises
}

async function processFiles(): Promise<void>  {
    const originalCssFilesDirectory = './pico-original-files'
    const processedCssFilesDirectory = '../files'

    Promise.all(createScopedPicoFiles(originalCssFilesDirectory, processedCssFilesDirectory)).then(() => {
        process.stdout.write('Successfully completed writing output css files.')
    })
}

export {
    createScopedPicoFile,
    createScopedPicoFiles
}

module.exports.processFiles = processFiles


