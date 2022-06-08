
const fs = require("fs")
import { createScopedPicoFiles } from '../src/process-pico-files'

const mockInputCssFileName = 'original-file-1.css'
const mockOutputCssFileName = 'scoped.' + mockInputCssFileName
const mockInputDirectory = `${process.cwd()}/test/test-input-directory`
const mockOutputDirectory = `${process.cwd()}/test/test-output-directory`
const expectedOutputCssDirectory = `${process.cwd()}/test`
const expectedOutputCssFileName = 'expected-output.css'

describe('createScopedPicoFiles', () => {
	beforeEach(() => {
		if (fs.existsSync(mockOutputDirectory)) {
			fs.rmdirSync(mockOutputDirectory, { recursive: true });
		}
    })

	test('should correctly process pico css files', () => {
	
		return Promise.all(createScopedPicoFiles(mockInputDirectory, mockOutputDirectory)).then(() => {
			const actualOutputCss = fs.readFileSync(`${mockOutputDirectory}/${mockOutputCssFileName}`, 'utf8')
			const expectedOutputCss = fs.readFileSync(`${expectedOutputCssDirectory}/${expectedOutputCssFileName}`, 'utf8')

			expect(actualOutputCss).toEqual(expectedOutputCss)	
		})
	})
})	

