import "./Code.css";

export default function Code() {
	document.querySelectorAll<HTMLInputElement>("code").forEach(elm => {
		elm.addEventListener("input", function (evt) {});
	});
}

// function getCursorPosition(editableDiv) {
//   let selection = window.getSelection();
//   let range = selection.getRangeAt(0);
//   let preCaretRange = range.cloneRange();
//   preCaretRange.selectNodeContents(editableDiv);
//   preCaretRange.setEnd(range.endContainer, range.endOffset);
//   let caretOffset = preCaretRange.toString().length;

//   return caretOffset;
// }
