import { Compiler } from "../../../../../../../02-Function/compiler/compiler";
import {
	TOKEN,
	Token,
} from "../../../../../../../02-Function/compiler/tokenizer";
import "./BoxCode.css";

export default function BoxCode() {
	document.querySelectorAll<HTMLElement>("box-code").forEach(elm => {
		const div = elm.firstElementChild as HTMLDivElement;
		const input = elm.lastElementChild as HTMLInputElement;

		const compiler = new Compiler();

		input.addEventListener("input", evt => {
			console.log("fuck");
			compiler.run(input.value);

			console.log(compiler.tokens);

			div.innerHTML = Highlight(compiler.tokens);
		});

		input.addEventListener("change", evt => {});
	});
}

function Highlight(tokens: Token[]) {
	let s = "";
	for (const token of tokens) {
		s += `<lex-${token.type}>${token.lexeme}</lex-${token.type}>`;
		// switch (token.type) {
		// 	case TOKEN.label:
		// 		s += `<lex-label>${token.lexeme}</lex-label>`;
		// 		break;

		//     case TOKEN.arrow:
		//       s += `<lex-arrow>${token.lexeme}</lex-arrow>`;
		//       break;

		//     case TOKEN.symbol:
		//       s += `<lex-symbol>${token.lexeme}</lex-symbol>`;
		//       break;

		// 	default:
		// 		break;
		// }
	}
	return s;
}
