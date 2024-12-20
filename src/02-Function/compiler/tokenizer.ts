import { Compiler } from "./compiler";

export class Tokenizer {
	private start = 0;
	private cursor = 0;

	private row = 1;
	private col = 1;

	private tokens: Token[] = [];
	constructor(private compiler: Compiler, private source: string) {}

	tokenize(): Token[] {
		while (!this.is_at_end()) {
			this.start = this.cursor;
			this.scanToken();
		}

		this.tokens.push(new Token(TOKEN.eof, "", null, this.row, this.col));
		return this.tokens;
	}

	is_at_end(): boolean {
		return this.cursor >= this.source.length;
	}

	scanToken() {
		const c = this.advance();

		switch (c) {
			case "(":
				return this.addToken(TOKEN.paren_l);
			case ")":
				return this.addToken(TOKEN.paren_r);
			case "[":
				return this.addToken(TOKEN.squaren_l);
			case "]":
				return this.addToken(TOKEN.squaren_r);
			case "{":
				return this.addToken(TOKEN.curlen_l);
			case "}":
				return this.addToken(TOKEN.curlen_r);
			case ",":
				return this.addToken(TOKEN.comma);
			case ";":
				return this.addToken(TOKEN.semicolon);
			case ":":
				return this.addToken(TOKEN.colon);

			case "⊗":
			case "¤":
				return this.addToken(TOKEN.join);

			case "'":
			case "`":
				return this.addToken(TOKEN.quote);
			case ".":
				return this.addToken(this.match(".") ? TOKEN.range : TOKEN.dot);
			case "⋅":
				return this.addToken(TOKEN.juxt);
			case "→":
				return this.addToken(TOKEN.arrow);
			case "-":
				return this.addToken(this.match(">") ? TOKEN.arrow : TOKEN.sub);
			case "+":
				return this.addToken(TOKEN.add);
			case "*":
				return this.addToken(TOKEN.mul);
			case "^":
				return this.addToken(this.match("/") ? TOKEN.rad : TOKEN.pow);
			case "\\":
				return this.addToken(TOKEN.log);

			case "!":
				return this.addToken(
					this.match("=") ? TOKEN.not_equal : TOKEN.bang,
				);

			case "=":
				return this.addToken(TOKEN.equal);

			case "<":
				return this.addToken(
					this.match("=") ? TOKEN.less_equal : TOKEN.less,
				);

			case ">":
				return this.addToken(
					this.match("=") ? TOKEN.greater_equal : TOKEN.greater,
				);

			case "/":
				return this.addToken(TOKEN.div);

			case " ":
			case "\r":
			case "\t":
				return this.addToken(TOKEN.space);

			case "\n":
				this.col = 1;
				this.row += 1;
				return;

			case '"':
				return this.string();

			case "#":
				return this.select();

			// case ":":
			// 	return this.number()

			default:
				if (this.is_digit(c)) return this.number();
				if (this.is_alpha(c)) return this.symbol();

				// this.compiler.error(this.row, this.col, `Unexpected character: ${c}`);
				throw new TokenError(
					this.row,
					this.col,
					`Unexpected character: ${c}`,
				);
		}
	}

	advance(): string {
		const c = this.source.at(this.cursor)!;
		this.cursor += 1;
		this.col += 1;
		return c;
	}

	addToken(type: TOKEN, literal: any = null) {
		const text = this.source.slice(this.start, this.cursor);
		this.tokens.push(
			new Token(type, text, literal, this.row, this.col - text.length),
		);

		if (
			this.tokens.at(-1)?.type == TOKEN.arrow &&
			this.tokens.at(-2)?.type == TOKEN.symbol
		) {
			this.tokens.at(-2)!.type = TOKEN.label;
			// this.tokens.pop();
		}
	}

	match(expect: string): boolean {
		if (this.is_at_end()) return false;
		if (this.source.at(this.cursor) != expect) return false;

		this.cursor += 1;
		this.col += 1;
		return true;
	}

	peek(offset = 0) {
		if (this.cursor + offset >= this.source.length) return "";
		return this.source.at(this.cursor + offset)!;
	}

	is_digit(c: string) {
		return c >= "0" && c <= "9";
	}

	is_arrow(c: string) {}

	is_alpha(c: string) {
		return (
			(c >= "a" && c <= "z") ||
			(c >= "A" && c <= "Z") ||
			c == "_" ||
			this.is_greek(c)
		);
	}

	is_greek(c: string) {
		const cp = c.codePointAt(0)!;
		return (cp >= 0x370 && cp <= 0x3ff) || (cp >= 0x1f00 && cp <= 0x1fff);
	}

	is_alphanumeric(c: string) {
		return this.is_alpha(c) || this.is_digit(c);
	}

	string() {
		while (this.peek() != '"' && !this.is_at_end()) {
			if (this.peek() == "\n") {
				this.row += 1;
				this.col = 0;
			}
			this.advance();
		}

		if (this.is_at_end()) {
			this.compiler.error(this.row, this.col, "Unterminated string.");
			return;
		}

		// eat closing "
		this.advance();

		// trim surrounding quotes from string literal
		// todo: scan and replace escape sequences
		const value = this.source.slice(this.start + 1, this.cursor - 1);
		this.addToken(TOKEN.string, value);
	}

	number() {
		while (this.is_digit(this.peek())) this.advance();

		let is_decimal = false;
		// Look for a fractional part
		if (this.peek() == "." && this.is_digit(this.peek(1))) {
			// consume the '.'
			this.advance();
			is_decimal = true;

			while (this.is_digit(this.peek())) this.advance();
		}

		this.addToken(
			is_decimal ? TOKEN.decimal : TOKEN.integer,
			Number(this.source.slice(this.start, this.cursor)),
		);
	}

	select() {
		// eat '#'
		this.advance();

		while (this.is_digit(this.peek())) this.advance();

		this.addToken(
			TOKEN.select,
			Number(this.source.slice(this.start + 1, this.cursor)),
		);
	}

	symbol() {
		while (this.is_alphanumeric(this.peek())) this.advance();

		// const text = this.source.slice(this.start, this.cursor)
		// no keywords in braid
		// if (this.match("→") || (this.match("-") && this.match(">"))) this.addToken(TOKEN.label);

		this.addToken(TOKEN.symbol);

		const last = this.tokens.at(-1)!;

		switch (last.lexeme) {
			case "false":
				last.type = TOKEN.false;
				break;

			case "true":
				last.type = TOKEN.true;
				break;

			case "where":
				last.type = TOKEN.where;
				break;

			default:
				break;
		}
	}
}

export class TokenError extends SyntaxError {
	constructor(
		public row: number,
		public col: number,
		message: string,
		options?: ErrorOptions,
	) {
		super(message, options);
	}
}

export class Token {
	constructor(
		public type: TOKEN,
		public lexeme: string,
		public literal: any,

		public row: number,
		public col: number,
	) {}

	toString() {
		return `${this.type} ${this.lexeme} ${this.literal}`;
	}

	clone() {
		return new Token(
			this.type,
			this.lexeme,
			this.literal,
			this.row,
			this.col,
		);
	}
}

export enum TOKEN {
	paren_l = "(",
	paren_r = ")",
	squaren_r = "]",
	squaren_l = "[",
	curlen_l = "{",
	curlen_r = "}",

	comma = ",",
	semicolon = ";",
	colon = ":",
	quote = "'",
	space = "space",

	dot = ".",
	range = "..",
	// arrow = "→",
	arrow = "arrow",

	join = "¤",
	juxt = "⋅",

	add = "+",
	sub = "-",
	div = "/",
	mul = "*",

	pow = "^",
	log = "\\",
	rad = "√",

	bang = "!",

	not_equal = "≠",
	equal = "=",

	greater_equal = "≥",
	greater = ">",
	less_equal = "≤",
	less = "<",

	symbol = "symbol",
	label = "label",

	array = "array",

	string = "string",

	integer = "integer",
	decimal = "decimal",

	select = "select",

	eof = "eof",

	where = "where",
	true = "true",
	false = "false",
}

export const PrimaryTokens = [
	TOKEN.integer,
	TOKEN.decimal,
	TOKEN.string,
	TOKEN.symbol,
	TOKEN.select,
	TOKEN.paren_l,
	TOKEN.squaren_l,
	TOKEN.curlen_l,
	TOKEN.true,
	TOKEN.false,
	TOKEN.colon,
];

export const TerminalTokens = [
	TOKEN.label,
	TOKEN.where,
	TOKEN.curlen_r,
	TOKEN.paren_r,
	TOKEN.squaren_r,
	TOKEN.eof,
];

export const RuleDelimiters = [TOKEN.label, TOKEN.curlen_l, TOKEN.eof];
