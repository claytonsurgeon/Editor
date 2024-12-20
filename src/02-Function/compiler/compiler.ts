import { Token, Tokenizer } from "./tokenizer";

export class Compiler {
	private decoder = new TextDecoder("utf-8");
	private encoder = new TextEncoder();

	private had_error = false;

	private interval = 0;

	tokens: Token[] = [];

	constructor() {}

	async run(source: string) {
		this.tokens = new Tokenizer(this, source).tokenize();
	}

	error(row: number, col: number, message: string) {
		this.report(row, col, "", message);
	}

	report(row: number, col: number, context: string, message: string) {
		console.log(`[row ${row}][col ${col}] Error${context}: ${message}`);
		this.had_error = true;
	}
}
